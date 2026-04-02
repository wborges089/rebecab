

## Tornar a Versão B Responsiva

### Problema
No desktop (telas largas), a foto de fundo com `bg-cover` fica distorcida/sobreposta ao conteúdo porque o hero tem altura fixa (`min-h-[50vh]`) e o `mt-[30vh]` empurra o texto para fora. Em telas grandes a imagem estica demais.

### Solução
Ajustar o hero para funcionar bem em mobile e desktop:

1. **Hero section** — usar alturas responsivas: `min-h-[50vh] md:min-h-[60vh]` e margem top responsiva `mt-[25vh] md:mt-[35vh]` para que o texto fique abaixo do rosto em ambos os tamanhos
2. **Background position** — usar `background-position: center 20%` para que o rosto fique visível tanto em mobile quanto desktop
3. **Texto** — ajustar `max-w-3xl md:max-w-4xl` e padding lateral maior no desktop (`px-4 md:px-8`)
4. **Limitar largura da imagem de fundo** — adicionar `background-size: cover` com um container que limita a proporção no desktop, ou usar `md:min-h-[50vh]` para evitar esticamento excessivo

### Arquivo editado
- `src/pages/IndexB.tsx` — ajustes de classes responsivas no hero e no container de texto

