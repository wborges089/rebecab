

## Teste A/B - Versão B da Landing Page

### Resumo
Criar uma segunda landing page (`/b`) com layout diferente e foto de fundo esmaecida, mantendo a mesma lógica de CTA com timer de 60 segundos e o mesmo popup de captura de leads.

### Versão B - Diferenças
- **Foto como background**: A foto do especialista será usada como imagem de fundo em tela cheia, com overlay escuro (esmaecida), em vez de circular no hero
- **Layout centralizado**: Headline e subtítulo sobrepostos à foto de fundo, centralizados
- **Vídeo player** abaixo do hero com background, mantendo o mesmo comportamento de timer
- **Mesmo CTA e popup** de captura de leads (reutiliza o componente `LeadCaptureDialog`)

### Alterações técnicas

1. **Criar `src/pages/IndexB.tsx`**
   - Layout full-width com a foto como `background-image` no hero, com overlay escuro semi-transparente
   - Headline e texto centralizados sobre o background
   - Player de vídeo e CTA abaixo, mesma lógica de 60 segundos
   - Reutiliza `LeadCaptureDialog`

2. **Atualizar `src/App.tsx`**
   - Adicionar rota `/b` apontando para `IndexB`

Ambas as páginas compartilham o mesmo componente de captura, facilitando comparar resultados no `localStorage`.

