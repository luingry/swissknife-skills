# Manual installation

Clone the repository, then copy the skills you want. The commands below copy all four skills.
To install only the recommended default set, omit `juicy-scrn-cptr` deliberately.

## Codex

Codex discovers user skills in `~/.agents/skills`.

```powershell
New-Item -ItemType Directory -Force ~/.agents/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" ~/.agents/skills/
}
if (-not (Test-Path ~/.agents/design-taste.md)) {
  Copy-Item .\design-taste.md ~/.agents/design-taste.md
}
```

```sh
mkdir -p ~/.agents/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" ~/.agents/skills/
done
[ -e ~/.agents/design-taste.md ] || cp ./design-taste.md ~/.agents/design-taste.md
```

## Claude Code

Claude Code discovers user skills in `~/.claude/skills`.

```powershell
New-Item -ItemType Directory -Force ~/.claude/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" ~/.claude/skills/
}
```

```sh
mkdir -p ~/.claude/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" ~/.claude/skills/
done
```

`design-intelligence` can use `~/.agents/design-taste.md` when it is available; it is optional.
To reuse this repository's starter taste memory without overwriting an existing one:

```powershell
New-Item -ItemType Directory -Force ~/.agents | Out-Null
if (-not (Test-Path ~/.agents/design-taste.md)) {
  Copy-Item .\design-taste.md ~/.agents/design-taste.md
}
```

## Cursor

Cursor supports Agent Skills through `~/.agents/skills`; use the Codex copy commands above for a
user-wide install. For a repository-local installation, copy selected folders into
`.cursor/skills/`:

```powershell
New-Item -ItemType Directory -Force .cursor/skills | Out-Null
foreach ($skill in 'design-intelligence', 'orchestration', 'delivery-verification', 'juicy-scrn-cptr') {
  Copy-Item -Recurse -Force ".\skills\$skill" .cursor/skills/
}
```

```sh
mkdir -p .cursor/skills
for skill in design-intelligence orchestration delivery-verification juicy-scrn-cptr; do
  cp -R "./skills/$skill" .cursor/skills/
done
```

Read [compatibility.md](compatibility.md) before relying on a skill's runtime behavior outside
Codex.
