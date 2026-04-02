

## Ajustes no Formulario, Quiz e Fluxo Pos-Cadastro

### Problemas atuais
1. **Inputs com texto branco sobre fundo escuro** — dificil de ler. O `bg-secondary` e um cinza sage (`hsl(60 6% 73%)`) mas o `text-foreground` e branco claro, criando baixo contraste.
2. **Dialog nao se adapta bem ao mobile** — tamanho fixo `sm:max-w-md`, quiz pode cortar em telas pequenas.
3. **Apos o quiz, nao ha mensagem de "Obrigado"** clara e o video continua visivel.

### Correcoes planejadas

**1. Inputs com melhor contraste (`LeadCaptureDialog.tsx`)**
- Trocar `bg-secondary` dos inputs para `bg-white` com `text-gray-900` — fundo claro com texto escuro, legivel em qualquer tela.
- Placeholders em `text-gray-400`.

**2. Dialog responsivo e interativo (`LeadCaptureDialog.tsx`)**
- Adicionar classes responsivas ao DialogContent: `max-h-[90vh] overflow-y-auto w-[95vw] sm:max-w-md` para se adequar a telas pequenas.
- Callback `onComplete` agora tambem recebe sinal para a pagina pai esconder o video.

**3. Quiz responsivo (`TypebotQuiz.tsx`)**
- Ajustar tamanhos de fonte e padding para mobile: `text-base md:text-lg`, `px-3 py-2.5 md:px-4 md:py-3`.
- Scroll automatico dentro do dialog.

**4. Tela de Obrigado melhorada (`LeadCaptureDialog.tsx`)**
- Mensagem de agradecimento mais elaborada com icone e texto motivacional.

**5. Video desaparece apos cadastro (`Index.tsx` e `IndexB.tsx`)**
- Novo estado `formCompleted` controlado via callback do `LeadCaptureDialog`.
- Quando `formCompleted = true`, a secao do video e substituida por uma mensagem de agradecimento em tela cheia.
- Prop `onFormComplete` adicionada ao `LeadCaptureDialog`.

### Arquivos editados
- `src/components/LeadCaptureDialog.tsx` — inputs claros, dialog responsivo, callback onFormComplete
- `src/components/TypebotQuiz.tsx` — tamanhos responsivos
- `src/pages/Index.tsx` — estado formCompleted, esconde video
- `src/pages/IndexB.tsx` — mesmo ajuste

