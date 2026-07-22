# ERRORS.md — erros não-triviais e soluções

## `mix-blend-mode` silenciosamente ignorado no render do Remotion (FilmGrain invisível)

- **Sintoma:** o componente `FilmGrain` (feTurbulence em SVG, camada superior do
  `DemoStage`) não aparecia em nada nos stills renderizados — variação de luma de apenas
  1 nível em área chapada, mesmo com `opacity: 1`. Isolado (HTML estático ou composição
  Remotion mínima), o mesmo markup renderizava perfeitamente.
- **Causa raiz:** `mixBlendMode: 'overlay'` na camada do grain é descartado pelo
  compositor do renderer quando os irmãos na mesma stacking context incluem as camadas
  blendadas do `<CameraMotionBlur>` (@remotion/motion-blur). O filtro SVG renderiza, mas o
  blend resulta em no-op visual.
- **Solução:** remover o `mixBlendMode` e usar ruído cinza source-over com opacidade baixa
  (~0.05). Verificado: range de luma ±4 níveis em área chapada — sutil e confiável.
  Registrado no docstring de `FilmGrain` (`skills/juicy-scrn-cptr/.../Stage.tsx`).
- **Prevenção:** em camadas overlay dentro do `DemoStage`, não confiar em blend modes;
  validar qualquer efeito de camada com um still medido (ffmpeg `signalstats`), não a olho.

## Rename de pasta de skill bloqueado por junction em `~/.claude/skills`

- **Sintoma:** `git mv` e `Rename-Item` falharam com "Permission denied"/"acesso negado"
  ao renomear `skills/screen-demo-video` → `skills/juicy-scrn-cptr`.
- **Causa raiz:** uma directory junction em `%USERPROFILE%\.claude\skills\screen-demo-video`
  apontava para a pasta (instalação global da skill documentada no README), mantendo um
  handle que impede o rename do alvo.
- **Solução:** `robocopy /E` para o novo nome + `Remove-Item -Recurse -Force` no antigo;
  depois recriar a junction global apontando para o novo caminho
  (`cmd /c rmdir` na junction velha + `mklink /J` na nova).
- **Prevenção:** ao renomear qualquer skill deste repo, tratar a junction global primeiro
  (remover → renomear → recriar).
