

## Ajustes de Contraste no Quiz, Login e Foto de Fundo no Login

### Problemas (conforme screenshots)
1. **Quiz**: opcoes com texto cinza claro sobre fundo cinza escuro — baixo contraste. Checkboxes quase invisiveis.
2. **Login**: inputs com `bg-secondary` e `text-foreground` (branco sobre cinza) — dificil de ler. Sem foto de fundo.

### Correcoes

**1. `src/components/TypebotQuiz.tsx`** — Melhorar contraste das opcoes
- Opcoes single-select: fundo `bg-white/90` com `text-gray-900` para texto escuro legivel
- Opcoes multi-select: mesmo tratamento, com estado selecionado usando `bg-primary/20 border-primary text-gray-900`
- Checkbox: adicionar classe para borda visivel (branca ou primary)

**2. `src/pages/AdminLogin.tsx`** — Inputs claros + foto de fundo esmaecida
- Adicionar a mesma foto da expert (`heroPhoto`) como background fullscreen com overlay escuro (`bg-background/70`)
- Inputs: trocar `bg-secondary` para `bg-white` com `text-gray-900` — mesmo padrao do formulario de leads
- Centralizar o formulario sobre o fundo esmaecido

### Arquivos editados
- `src/components/TypebotQuiz.tsx`
- `src/pages/AdminLogin.tsx`

