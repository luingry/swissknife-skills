# Generates a new lightweight Windows tray app from assets/scaffold.
# This file stays pure ASCII: Windows PowerShell 5.1 reads BOM-less UTF-8 as ANSI.
[CmdletBinding()]
param(
    [Parameter(Mandatory)][ValidatePattern('^[A-Za-z][A-Za-z0-9]+$')][string]$Name,
    [Parameter(Mandatory)][string]$OutputDir,
    [ValidatePattern('^[^<>&"{}]+$')][string]$Publisher,
    [ValidatePattern('^https?://\S+$')][string]$RepoUrl
)
$ErrorActionPreference = 'Stop'

# The name becomes the root namespace, and these would hide the scaffold's own namespaces and types, so the code would not compile.
$reserved = 'App', 'AppSettings', 'Artwork', 'AtomicFile', 'Core', 'Microsoft', 'Native', 'NativeMethods', 'SettingsWindow', 'Shell', 'Snapshot',
    'StartupRegistration', 'Switch', 'System', 'Tests', 'Theme', 'TrayIcon', 'TrayMenuWindow', 'Ui', 'UserFolders'
if ($Name -in $reserved) { throw "'$Name' collides with a namespace or type in the scaffold. Choose another name." }
$output = [IO.Path]::GetFullPath($OutputDir)
if (Test-Path -LiteralPath $output) { throw "OutputDir already exists: $output" }
# Past the .NET Framework path limit the exe dies in WPF startup with a modal mscorlib assert, before any app code runs.
$exePath = Join-Path $output "src\$Name\bin\Release\net48\$Name.exe"
if ($exePath.Length -gt 200) {
    throw "The generated exe path would be $($exePath.Length) characters, over the limit of 200: $exePath. Pick a shorter -OutputDir."
}

$lower = $Name.ToLowerInvariant()
$tokens = [ordered]@{
    '__APP_LOWER__' = $lower
    '__APP__'       = $Name
    '__PUBLISHER__' = $(if ($Publisher) { $Publisher } else { "$Name authors" })
    '__REPO_URL__'  = $(if ($RepoUrl) { $RepoUrl.TrimEnd('/') } else { "https://github.com/OWNER/$lower" })
    '__GUID__'      = [guid]::NewGuid().ToString().ToUpperInvariant()
}
function Expand-Tokens([string]$Text) {
    foreach ($token in $tokens.GetEnumerator()) { $Text = $Text.Replace($token.Key, $token.Value) }
    return $Text
}

$scaffold = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\assets\scaffold'))
$utf8 = New-Object Text.UTF8Encoding($false)
$files = Get-ChildItem -LiteralPath $scaffold -Recurse -File -Force
foreach ($file in $files) {
    $relative = Expand-Tokens $file.FullName.Substring($scaffold.Length + 1)
    if ($relative -match '(^|\\)(bin|obj)\\') { throw "The scaffold must stay source only: $relative" }
    $target = Join-Path $output $relative
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target)) | Out-Null
    $text = Expand-Tokens ([IO.File]::ReadAllText($file.FullName, $utf8))
    if ($text -match '__[A-Z_]+__') { throw "Unknown token $($Matches[0]) in $relative" }
    [IO.File]::WriteAllText($target, $text, $utf8)
}

Write-Host "Generated $Name in $output ($($files.Count) files)."
Write-Host ''
Write-Host 'Next steps:'
Write-Host '  1. powershell -ExecutionPolicy Bypass -File scripts\build.ps1   (builds, draws the icon, runs the tests)'
Write-Host "  2. src\$Name\bin\Release\net48\$Name.exe --snapshot snapshots   (look at the images)"
Write-Host '  3. Write the thesis in AGENTS.md and the idea in docs\DESIGN_SYSTEM.md.'
Write-Host "  4. Replace every PLACEHOLDER in src\$Name\Theme\Tokens.xaml and the mark in src\$Name\Ui\Artwork.cs."
Write-Host '     The installer refuses to build until Tokens.xaml is clean; build.ps1 lists what remains.'
Write-Host '  5. Complete README.md and run scripts\build-installer.ps1.'
if (-not $RepoUrl) { Write-Host "  6. Replace the OWNER placeholder in README.md and installer\$Name.iss with the real repository." }
