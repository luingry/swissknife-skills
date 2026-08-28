[CmdletBinding()]
param(
    [ValidateNotNullOrEmpty()]
    [string]$RepositoryPath,

    [ValidateNotNullOrEmpty()]
    [string]$DirectPath,

    [Parameter(Mandatory)]
    [ValidateSet('gpt-5.6-luna', 'gpt-5.3-codex-spark')]
    [string]$Model,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Prompt,

    [ValidateSet('read-only', 'workspace-write')]
    [string]$AccessMode = 'read-only',

    [ValidateSet('low', 'medium', 'high', 'xhigh', 'max', 'ultra')]
    [string]$ReasoningEffort = 'low',

    [switch]$IncludeUserConfig,

    [string]$WorktreePath,

    [ValidateNotNullOrEmpty()]
    [string]$BaseRef = 'HEAD',

    [string]$OutputPath,

    [string]$ResumeThreadId,

    [string]$CliPath
)

$ErrorActionPreference = 'Stop'

function Resolve-FullPath {
    param([Parameter(Mandatory)][string]$Path)

    return [System.IO.Path]::GetFullPath($ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path))
}

function Resolve-CodexCli {
    param([string]$RequestedPath)

    if ($RequestedPath) {
        $resolved = Resolve-FullPath $RequestedPath
        if (-not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
            throw "Codex CLI not found at explicit path: $resolved"
        }
        return $resolved
    }

    $preferred = 'C:\Users\luing\.codex\plugins\.plugin-appserver\codex.exe'
    if (Test-Path -LiteralPath $preferred -PathType Leaf) {
        return $preferred
    }

    foreach ($name in @('codex.exe', 'codex')) {
        $candidate = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue |
            Sort-Object { $_.Source -match '\\WindowsApps\\' } |
            Select-Object -First 1
        if ($candidate) {
            return $candidate.Source
        }
    }

    throw 'Codex CLI was not found. Pass -CliPath explicitly.'
}

function ConvertTo-NativeArgument {
    param([AllowEmptyString()][string]$Value)

    if ($Value -notmatch '[\s"]' -and $Value.Length -gt 0) {
        return $Value
    }

    $builder = [System.Text.StringBuilder]::new()
    [void]$builder.Append('"')
    $backslashes = 0
    foreach ($character in $Value.ToCharArray()) {
        if ($character -eq '\') {
            $backslashes++
            continue
        }
        if ($character -eq '"') {
            [void]$builder.Append(('\' * (($backslashes * 2) + 1)))
            [void]$builder.Append('"')
            $backslashes = 0
            continue
        }
        if ($backslashes -gt 0) {
            [void]$builder.Append(('\' * $backslashes))
            $backslashes = 0
        }
        [void]$builder.Append($character)
    }
    if ($backslashes -gt 0) {
        [void]$builder.Append(('\' * ($backslashes * 2)))
    }
    [void]$builder.Append('"')
    return $builder.ToString()
}

$hasRepositoryPath = -not [string]::IsNullOrWhiteSpace($RepositoryPath)
$hasDirectPath = -not [string]::IsNullOrWhiteSpace($DirectPath)
if ($hasRepositoryPath -eq $hasDirectPath) {
    throw 'Specify exactly one of -RepositoryPath (isolated git worktree) or -DirectPath (Luna read-only, no worktree).'
}

$directMode = $hasDirectPath
$repository = $null
$gitRoot = $null
$repositoryCommonDir = $null
$executionPath = $null

if ($directMode) {
    if ($Model -ne 'gpt-5.6-luna') {
        throw 'DirectPath mode is restricted to gpt-5.6-luna.'
    }
    if ($AccessMode -ne 'read-only') {
        throw 'DirectPath mode is restricted to read-only access.'
    }
    if ($WorktreePath) {
        throw 'DirectPath mode cannot use -WorktreePath.'
    }
    $executionPath = Resolve-FullPath $DirectPath
    if (-not (Test-Path -LiteralPath $executionPath -PathType Container)) {
        throw "Direct path does not exist: $executionPath"
    }
} else {
    $repository = Resolve-FullPath $RepositoryPath
    if (-not (Test-Path -LiteralPath $repository -PathType Container)) {
        throw "Repository path does not exist: $repository"
    }

    $gitRoot = (& git -C $repository rev-parse --show-toplevel 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $gitRoot) {
        throw "Not a git repository: $repository"
    }
    $gitRoot = Resolve-FullPath $gitRoot.Trim()
    $repositoryCommonDir = (& git -C $gitRoot rev-parse --path-format=absolute --git-common-dir 2>$null)
    if ($LASTEXITCODE -ne 0 -or -not $repositoryCommonDir) {
        throw "Could not resolve git common directory for: $gitRoot"
    }
    $repositoryCommonDir = Resolve-FullPath $repositoryCommonDir.Trim()

    & git -C $gitRoot rev-parse --verify "$BaseRef^{commit}" *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "Base ref does not resolve to a commit: $BaseRef"
    }
}

$cli = Resolve-CodexCli $CliPath
$catalogText = (& $cli debug models 2>&1 | Out-String)
if ($LASTEXITCODE -ne 0) {
    throw "Codex CLI model discovery failed: $catalogText"
}
try {
    $catalog = $catalogText | ConvertFrom-Json
} catch {
    throw "Codex CLI returned invalid model-catalog JSON: $($_.Exception.Message)"
}
$selectedModel = @($catalog.models | Where-Object slug -eq $Model)[0]
if (-not $selectedModel) {
    throw "Model '$Model' is not present in the live Codex CLI catalog."
}
$supportedEfforts = @($selectedModel.supported_reasoning_levels.effort)
if ($ReasoningEffort -notin $supportedEfforts) {
    throw "Reasoning effort '$ReasoningEffort' is not supported by '$Model'. Supported values: $($supportedEfforts -join ', ')."
}

$createdWorktree = $false
$worktree = $null
if ($directMode) {
    $worktree = $null
} else {
    $status = @(& git -C $gitRoot status --porcelain=v1 --untracked-files=normal)
    if ($status.Count -gt 0) {
        Write-Warning 'The source checkout is dirty. A worktree created from a commit does not include these uncommitted or untracked changes.'
    }

    if ($WorktreePath) {
        $worktree = Resolve-FullPath $WorktreePath
    } else {
        $worktree = Join-Path ([System.IO.Path]::GetTempPath()) ("codex-worker-{0}" -f [guid]::NewGuid().ToString('N'))
    }

    if (Test-Path -LiteralPath $worktree) {
        $worktreeRoot = (& git -C $worktree rev-parse --show-toplevel 2>$null)
        if ($LASTEXITCODE -ne 0 -or -not $worktreeRoot) {
            throw "Existing worktree path is not a git checkout: $worktree"
        }
        if ((Resolve-FullPath $worktreeRoot.Trim()) -eq $gitRoot) {
            throw 'WorktreePath resolves to the main checkout; a dedicated worktree is required.'
        }
        $worktreeCommonDir = (& git -C $worktree rev-parse --path-format=absolute --git-common-dir 2>$null)
        if ($LASTEXITCODE -ne 0 -or -not $worktreeCommonDir -or
            (Resolve-FullPath $worktreeCommonDir.Trim()) -ne $repositoryCommonDir) {
            throw "Existing worktree does not belong to the requested repository: $worktree"
        }
    } else {
        $parent = Split-Path -Parent $worktree
        if (-not (Test-Path -LiteralPath $parent -PathType Container)) {
            [System.IO.Directory]::CreateDirectory($parent) | Out-Null
        }
        & git -C $gitRoot worktree add --detach $worktree $BaseRef
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create worktree at: $worktree"
        }
        $createdWorktree = $true
    }
    $executionPath = $worktree
}

if ($OutputPath) {
    $jsonlPath = Resolve-FullPath $OutputPath
} else {
    $logDirectory = Join-Path ([System.IO.Path]::GetTempPath()) 'codex-worker-logs'
    $jsonlPath = Join-Path $logDirectory ('{0}-{1}.jsonl' -f (Get-Date -Format 'yyyyMMdd-HHmmss-fff'), [guid]::NewGuid().ToString('N'))
}
$outputParent = Split-Path -Parent $jsonlPath
if (-not (Test-Path -LiteralPath $outputParent -PathType Container)) {
    [System.IO.Directory]::CreateDirectory($outputParent) | Out-Null
}
$stderrPath = "$jsonlPath.stderr.log"
if (Test-Path -LiteralPath $jsonlPath -PathType Leaf) {
    throw "Output path already exists; refusing to overwrite: $jsonlPath"
}
if (Test-Path -LiteralPath $stderrPath -PathType Leaf) {
    throw "Stderr path already exists; refusing to overwrite: $stderrPath"
}

$arguments = @(
    '--ask-for-approval', 'never',
    '-C', $executionPath,
    '-m', $Model,
    '-c', 'agents.enabled=false',
    '-c', ('model_reasoning_effort="{0}"' -f $ReasoningEffort),
    '--sandbox', $AccessMode,
    'exec'
)
if ($directMode) {
    $arguments += '--skip-git-repo-check'
}
if (-not $IncludeUserConfig) {
    $arguments += '--ignore-user-config'
}
$arguments += '--json'
if ($ResumeThreadId) {
    $arguments += @('resume', $ResumeThreadId)
}
$arguments += $Prompt

$processInfo = [System.Diagnostics.ProcessStartInfo]::new()
$processInfo.FileName = $cli
$processInfo.UseShellExecute = $false
$processInfo.RedirectStandardInput = $true
$processInfo.RedirectStandardOutput = $true
$processInfo.RedirectStandardError = $true
$processInfo.CreateNoWindow = $true
$processInfo.Arguments = ($arguments | ForEach-Object { ConvertTo-NativeArgument ([string]$_) }) -join ' '

$process = [System.Diagnostics.Process]::new()
$process.StartInfo = $processInfo
if (-not $process.Start()) {
    throw 'Failed to start Codex CLI worker.'
}
$process.StandardInput.Close()

$stderrTask = $process.StandardError.ReadToEndAsync()
$jsonlWriter = [System.IO.StreamWriter]::new($jsonlPath, $false, [System.Text.UTF8Encoding]::new($false))
try {
    while (($line = $process.StandardOutput.ReadLine()) -ne $null) {
        $jsonlWriter.WriteLine($line)
        $jsonlWriter.Flush()
        Write-Output $line
    }
} finally {
    $jsonlWriter.Dispose()
}
$process.WaitForExit()
$workerExitCode = $process.ExitCode
[System.IO.File]::WriteAllText($stderrPath, $stderrTask.GetAwaiter().GetResult(), [System.Text.UTF8Encoding]::new($false))

$threadId = $null
Get-Content -LiteralPath $jsonlPath -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $event = $_ | ConvertFrom-Json -ErrorAction Stop
        if ($event.type -eq 'thread.started' -and $event.thread_id) {
            $script:threadId = $event.thread_id
        }
    } catch {
        Write-Warning "Non-JSON line in worker stdout: $_"
    }
}

[pscustomobject]@{
    CliPath = $cli
    Model = $Model
    ReasoningEffort = $ReasoningEffort
    IgnoredUserConfig = -not $IncludeUserConfig
    DirectMode = $directMode
    ExecutionPath = $executionPath
    WorktreePath = $worktree
    JsonlPath = $jsonlPath
    StderrPath = $stderrPath
    ExitCode = $workerExitCode
    CreatedWorktree = $createdWorktree
    ThreadId = $threadId
}

if ($workerExitCode -ne 0) {
    throw "Codex worker exited with code $workerExitCode. Worktree and logs were preserved."
}
