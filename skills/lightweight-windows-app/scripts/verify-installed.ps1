<#
.SYNOPSIS
  Installed proof for a Windows app. Installs and launches through WMI, and reads
  the registry and files through WMI, because agent shells see a virtualized view
  of HKCU and AppData inside an MSIX-packaged host such as Claude desktop.
.EXAMPLE
  verify-installed.ps1 -App MyApp -Version 1.2.3
.EXAMPLE
  verify-installed.ps1 -App MyApp -DisplayName "My App" -Version 1.2.3 -Installer artifacts\MyApp-Setup-1.2.3.exe -Launch -LaunchArgs --startup
#>
param(
    [Parameter(Mandatory)][string]$App,
    [Parameter(Mandatory)][string]$Version,
    [string]$DisplayName,
    [string]$ExeName,
    [string]$Installer,
    [switch]$Launch,
    [string]$LaunchArgs = '',
    [int]$TimeoutSeconds = 180
)
$ErrorActionPreference = 'Stop'
if (-not $DisplayName) { $DisplayName = $App }
if (-not $ExeName) { $ExeName = "$App.exe" }
$stem = [IO.Path]::GetFileNameWithoutExtension($ExeName)
$HKCU = [uint32]2147483649
$HKLM = [uint32]2147483650
$script:failures = 0

function Report([bool]$ok, [string]$text) {
    if ($ok) { Write-Output "PASS  $text" } else { Write-Output "FAIL  $text"; $script:failures++ }
}

# Win32_Process.Create starts the process from WmiPrvSE, outside the MSIX package.
function Start-Outside([string]$commandLine) {
    $result = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $commandLine }
    if ($result.ReturnValue -ne 0) { throw "Win32_Process.Create returned $($result.ReturnValue) for: $commandLine" }
    return [int]$result.ProcessId
}

function Read-RealValue([uint32]$hive, [string]$key, [string]$name) {
    (Invoke-CimMethod -ClassName StdRegProv -MethodName GetStringValue -Arguments @{ hDefKey = $hive; sSubKeyName = $key; sValueName = $name }).sValue
}

function Find-RealUninstall {
    foreach ($hive in $HKCU, $HKLM) {
        foreach ($root in 'Software\Microsoft\Windows\CurrentVersion\Uninstall', 'Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall') {
            $names = (Invoke-CimMethod -ClassName StdRegProv -MethodName EnumKey -Arguments @{ hDefKey = $hive; sSubKeyName = $root }).sNames
            foreach ($name in @($names)) {
                if (-not $name) { continue }
                $key = "$root\$name"
                if ([string](Read-RealValue $hive $key 'DisplayName') -like "$DisplayName*") {
                    return @{ Hive = $hive; Key = $key }
                }
            }
        }
    }
    return $null
}

function First-ThreeParts([string]$value) { (([string]$value).Trim() -split '\.')[0..2] -join '.' }

function Get-RealFile([string]$path) {
    Get-CimInstance CIM_DataFile -Filter ("Name='" + $path.Replace('\', '\\').Replace("'", "\'") + "'")
}

Add-Type -AssemblyName System.Drawing
Add-Type -Namespace VerifyInstalled -Name Shell32 -MemberDefinition '[DllImport("shell32.dll", CharSet = CharSet.Unicode)] public static extern uint ExtractIconExW(string file, int index, IntPtr[] large, IntPtr[] small, uint count);'

function Get-IconHash([string]$path) {
    $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
    try {
        $bitmap = $icon.ToBitmap()
        try {
            $stream = New-Object IO.MemoryStream
            $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
            return [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($stream.ToArray()))
        } finally { $bitmap.Dispose() }
    } finally { $icon.Dispose() }
}

$hostedName = "$stem.Hosted.exe"
$hosted = @(Get-CimInstance Win32_Process -Filter "Name = '$hostedName'")
if ($hosted.Count -gt 0) {
    Write-Output "WARN  $hostedName runs inside a host app (pid $($hosted[0].ProcessId)). A standalone launch signals it and exits. Ask the user whether to disable the module or swap it."
}

if ($Installer) {
    $setup = (Resolve-Path -LiteralPath $Installer).Path
    $log = "$setup.install.log"
    if (Test-Path -LiteralPath $log) { Remove-Item -LiteralPath $log -Force }
    $setupId = Start-Outside "`"$setup`" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /LOG=`"$log`""
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while (Get-Process -Id $setupId -ErrorAction SilentlyContinue) {
        if ((Get-Date) -gt $deadline) { throw "Installer still running after $TimeoutSeconds s." }
        Start-Sleep -Milliseconds 500
    }
    $succeeded = (Test-Path -LiteralPath $log) -and (Select-String -LiteralPath $log -SimpleMatch 'Installation process succeeded' -Quiet)
    Report $succeeded "installer log reports success: $log"
}

$uninstall = Find-RealUninstall
Report ($null -ne $uninstall) "real uninstall entry for '$DisplayName*'"
if ($null -eq $uninstall) {
    if (Get-ChildItem 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall' | Where-Object { [string]$_.GetValue('DisplayName') -like "$DisplayName*" }) {
        Write-Output "WARN  the entry exists only in the agent host's package view: this was installed from an agent shell. Reinstall with -Installer."
    }
    Write-Output "RESULT: $($script:failures) check(s) failed"
    exit 1
}
$displayVersion = Read-RealValue $uninstall.Hive $uninstall.Key 'DisplayVersion'
Report ($displayVersion -eq $Version) "DisplayVersion $displayVersion = $Version"

$location = Read-RealValue $uninstall.Hive $uninstall.Key 'Inno Setup: App Path'
if (-not $location) { $location = Read-RealValue $uninstall.Hive $uninstall.Key 'InstallLocation' }
Report ([bool]$location) "install location: $location"
if (-not $location) { Write-Output "RESULT: $($script:failures) check(s) failed"; exit 1 }
$exe = Join-Path $location $ExeName

$file = Get-RealFile $exe
Report ($null -ne $file) "real file exists: $exe"
if ($file) {
    Report ((First-ThreeParts $file.Version) -eq $Version) "file version $($file.Version) matches $Version"
    Report ([VerifyInstalled.Shell32]::ExtractIconExW($exe, -1, $null, $null, 0) -ge 1) "exe has an embedded icon"
    if ($Installer) { Report ((Get-IconHash $setup) -eq (Get-IconHash $exe)) "setup exe icon matches the app icon" }
}

$displayIcon = [string](Read-RealValue $uninstall.Hive $uninstall.Key 'DisplayIcon')
$iconFile = ($displayIcon -replace ',-?\d+$', '').Trim('"')
Report ([bool]$iconFile -and $null -ne (Get-RealFile $iconFile)) "uninstall entry icon: $displayIcon"

$menus = (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'), (Join-Path $env:ProgramData 'Microsoft\Windows\Start Menu\Programs')
$shortcut = Get-ChildItem $menus -Recurse -Filter *.lnk -ErrorAction SilentlyContinue |
    Where-Object { $_.BaseName -like "*$DisplayName*" -or $_.BaseName -like "*$App*" } | Select-Object -First 1
Report ($null -ne $shortcut) "Start Menu shortcut: $(if ($shortcut) { $shortcut.Name })"

if ($Launch) {
    [void](Start-Outside "`"$exe`" $LaunchArgs".Trim())
    $deadline = (Get-Date).AddSeconds(10)
    do {
        Start-Sleep -Milliseconds 500
        $found = @(Get-CimInstance Win32_Process -Filter "Name = '$ExeName'" | Where-Object { $_.ExecutablePath -ieq $exe })
    } while ($found.Count -eq 0 -and (Get-Date) -lt $deadline)
}

$running = @(Get-CimInstance Win32_Process -Filter "Name = '$ExeName'")
$fromInstall = @($running | Where-Object { $_.ExecutablePath -ieq $exe })
$unreadable = @($running | Where-Object { -not $_.ExecutablePath })
foreach ($process in $running | Where-Object { $_.ExecutablePath -and $_.ExecutablePath -ine $exe }) {
    Write-Output "WARN  pid $($process.ProcessId) is another copy: $($process.ExecutablePath)"
}
if ($fromInstall.Count -eq 0 -and $unreadable.Count -gt 0) {
    Write-Output "WARN  pid $($unreadable[0].ProcessId) has an unreadable path (probably elevated); confirm it by hand."
} else {
    Report ($fromInstall.Count -ge 1) "$ExeName runs from the install path ($($fromInstall.Count) process(es))"
}

$runKey = 'Software\Microsoft\Windows\CurrentVersion\Run'
foreach ($name in @($App, $stem) | Select-Object -Unique) {
    $real = Read-RealValue $HKCU $runKey $name
    $seen = (Get-Item "HKCU:\$runKey").GetValue($name)
    if ($real) { Write-Output "INFO  Run value '$name' = $real" }
    elseif ($seen) { Write-Output "WARN  Run value '$name' exists only in the agent host's package view, so it will not run at real logon." }
}

$store = Get-ChildItem (Join-Path $env:USERPROFILE 'AppData\Local\Packages') -Filter 'Claude_*' -Directory -ErrorAction SilentlyContinue
foreach ($package in $store) {
    foreach ($sub in 'LocalCache\Local\Programs', 'LocalCache\Local', 'LocalCache\Roaming') {
        foreach ($name in @($App, $stem) | Select-Object -Unique) {
            $stray = Join-Path $package.FullName (Join-Path $sub $name)
            if (Test-Path -LiteralPath $stray) { Write-Output "WARN  virtual-store copy exists: $stray" }
        }
    }
}

if ($script:failures -gt 0) {
    Write-Output "RESULT: $($script:failures) check(s) failed"
    exit 1
}
Write-Output "RESULT: installed proof OK for $App $Version"
