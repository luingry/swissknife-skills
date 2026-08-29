# ERRORS.md — erros não-triviais e soluções

## GitHub Actions falhava ao descobrir testes no Node 24

- **Sintoma:** o job em `lts/*` falhava no Node 24.19.0, em Ubuntu e Windows,
  com `MODULE_NOT_FOUND` ao executar `node --test tests`.
- **Causa raiz:** o Node 24 passou a tratar o argumento `tests` como módulo;
  o workflow havia acompanhado o LTS até essa versão e o script deixava de usar
  a descoberta padrão de arquivos de teste.
- **Solução:** trocar o script para `node --test`, que descobre os atuais
  `tests/*.test.mjs` tanto no Node 20 quanto no Node 24.
- **Prevenção:** quando o CI acompanha `lts/*`, validar explicitamente os
  comandos de teste na nova linha LTS e preferir a descoberta padrão quando a
  convenção de nomes já é suficiente.

## Claude Agent Teams could change ordinary subagent semantics before publication

- **Sintoma/risco:** a adaptação multiplataforma permitia subagentes Claude Code
  quando Agent Teams já estavam habilitados, sem uma autorização explícita para
  teams. Nessa condição, uma nomeação automática de subagente pode iniciá-lo
  como teammate, alterando comunicação, armazenamento de tarefas e o retorno ao
  owner.
- **Causa raiz:** a regra original cobria não habilitar Agent Teams
  automaticamente, mas omitia a semântica de `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:
  a documentação oficial informa que um subagente nomeado passa a ser teammate,
  inclusive sem pedido de team. A alegação inicial de que Claude não suportava
  nesting também veio de confiar em resumo/index/cache em vez do Markdown oficial
  atual, que documenta nesting até três camadas abaixo da conversa principal.
- **Solução:** antes de qualquer chamada Agent/subagent, confirmar o estado
  efetivo da flag por configuração ou ambiente exposto, sem modificá-lo. Sem
  confirmação de desabilitada, o adaptador permanece owner-sequential; com Teams
  confirmados e autorizados, exige evidência/mensagem explícita do teammate e
  aceitação pelo owner, pois a notificação idle não é o resultado. A skill mantém
  topologia rasa como política própria, não como limitação do host.
- **Prevenção:** antes de aplicar uma API de subagente em host experimental,
  verificar flags que alteram a semântica do mesmo call e conferir o `.md`
  canônico atual, não somente índice, resumo ou cache. Fontes:
  https://code.claude.com/docs/en/agent-teams e
  https://code.claude.com/docs/en/sub-agents.md

## Validador de repositório dependia de `yaml` vulnerável a YAML profundamente aninhado

- **Sintoma:** o `npm audit` do novo validador estrutural apontava vulnerabilidade moderada
  (`GHSA-48c2-rrv3-qjmp`) nas versões de `yaml` anteriores à 2.8.3.
- **Causa raiz:** a dependência inicial foi pinada em `yaml` 2.6.1, dentro do intervalo afetado.
- **Solução:** atualizar o pin direto do validador para `yaml` 2.9.0 e regenerar o lockfile.
- **Prevenção:** ao introduzir dependências de validação, rodar `npm audit` após gerar o lockfile;
  não usar dependências vulneráveis em parsers que leem arquivos versionados.

## Template de captura usava Playwright vulnerável na instalação de browsers

- **Sintoma:** o `npm audit --audit-level=high` do template apontava `GHSA-7mvr-c777-76hp`
  para `playwright` 1.49.1.
- **Causa raiz:** a versão direta estava abaixo do mínimo corrigido 1.55.1.
- **Solução:** atualizar para `playwright` 1.55.1, regenerar o lockfile, instalar o Chromium
  correspondente e provar uma captura real local com clique, digitação e scroll; foram gerados
  WebM e timeline com coordenadas/duração antes da limpeza dos artefatos temporários.
- **Prevenção:** ao atualizar a dependência de captura, rodar typecheck, audit de severidade alta
  e smoke contra página local com ações reais antes de publicar.

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
