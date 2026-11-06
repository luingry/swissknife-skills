param([switch]$SkipTests)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$project = Join-Path $root 'src\__APP__\__APP__.csproj'
$icon = Join-Path $root 'assets\__APP_LOWER__.ico'
$exe = Join-Path $root 'src\__APP__\bin\Release\net48\__APP__.exe'

function Build {
    dotnet build $project -c Release --nologo -v q
    if ($LASTEXITCODE) { throw 'Build failed.' }
}

# Past the .NET Framework path limit the exe dies in WPF startup with a modal mscorlib assert, before any app code runs.
if ($exe.Length -gt 200) { throw "The exe path is $($exe.Length) characters, over the limit of 200: $exe. Move the repository to a shorter path." }

# The icon is drawn by the app itself, so the first build has none to embed.
# A diagnostic exits by itself, so one still alive after 30 s has failed. Reading Handle keeps ExitCode available.
Build
$export = Start-Process -FilePath $exe -ArgumentList '--export-icon', "`"$icon`"" -PassThru
$null = $export.Handle
if (-not $export.WaitForExit(30000)) {
    $export.Kill()
    throw 'Icon export was still running after 30 s, so it was killed.'
}
if ($export.ExitCode -or -not (Test-Path -LiteralPath $icon)) { throw "Icon export failed with exit code $($export.ExitCode)." }
Build

if (-not $SkipTests) {
    dotnet run --project (Join-Path $root 'tests\__APP__.Tests\__APP__.Tests.csproj') -c Release --nologo
    if ($LASTEXITCODE) { throw 'Tests failed.' }
}

$templates = 'AGENTS.md', 'README.md', 'docs\DESIGN_SYSTEM.md', 'src\__APP__\Theme\Tokens.xaml', 'src\__APP__\Ui\Artwork.cs'
foreach ($template in $templates) {
    $count = @(Select-String -LiteralPath (Join-Path $root $template) -Pattern 'PLACEHOLDER' -SimpleMatch -CaseSensitive).Count
    if ($count) { Write-Warning "$template still has $count PLACEHOLDER line(s)." }
}
