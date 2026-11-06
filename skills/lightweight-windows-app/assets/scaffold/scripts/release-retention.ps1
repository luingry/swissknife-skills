# Keeps only the newest published releases: selects by version, never by date, so a re-run stays correct.
param(
    [int]$Keep = 3,
    [string[]]$Tags,
    [switch]$Apply
)
$ErrorActionPreference = 'Stop'

function Get-TagsToRemove([string[]]$AllTags, [int]$KeepCount) {
    $releases = @($AllTags | Where-Object { $_ -match '^v\d+\.\d+\.\d+$' } | Sort-Object { [version]$_.TrimStart('v') } -Descending)
    if ($releases.Count -le $KeepCount) { return @() }
    return @($releases[$KeepCount..($releases.Count - 1)])
}

if (-not $Tags) {
    $listed = gh release list --limit 200 --json tagName,isDraft,isPrerelease | ConvertFrom-Json
    if ($LASTEXITCODE) { throw 'Could not list releases.' }
    $Tags = @($listed | Where-Object { -not $_.isDraft -and -not $_.isPrerelease } | ForEach-Object { $_.tagName })
}

foreach ($tag in (Get-TagsToRemove $Tags $Keep)) {
    if ($Apply) {
        gh release delete $tag --cleanup-tag --yes
        if ($LASTEXITCODE) { throw "Could not delete release $tag." }
        Write-Host "Removed $tag"
    } else {
        Write-Output $tag
    }
}
