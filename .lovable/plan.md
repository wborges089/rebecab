

## Auditoria SEO e Performance — Paginas A (`/`) e B (`/b`)

### Problemas encontrados

**SEO**
1. `<html lang="en">` — deveria ser `pt-BR`
2. `<title>Lovable App</title>` — generico, sem relacao com o conteudo
3. `og:title` e `twitter:title` = "Lovable App" — sem valor para compartilhamento
4. `og:description` e `description` = "VSL Rebeca" — nao e descritivo para o usuario final
5. `meta author` = "Lovable" — deveria ser o nome da expert/marca
6. Sem `sitemap.xml`
7. `robots.txt` sem referencia ao sitemap
8. Sem `react-helmet-async` — ambas as paginas (A e B) compartilham os mesmos meta tags do `index.html`, impossibilitando SEO diferenciado por rota
9. Sem `canonical` URL
10. Imagem hero sem `width`/`height` (CLS)
11. Sem `<meta name="theme-color">`

**Performance / Carregamento**
1. Nenhuma rota usa `React.lazy()` — Admin, AdminLogin, LeadCaptureDialog sao carregados no bundle inicial mesmo que o usuario so visite `/`
2. Imagem hero (PNG) importada como asset estatico sem otimizacao — poderia ser WebP ou ter `loading="eager"` explicito com dimensoes fixas
3. Script Vturb injetado no `<head>` via `document.head.appendChild` — ok (async), mas sem `dns-prefetch` / `preconnect` para `scripts.converteai.net`

### Plano de correcoes

**1. `index.html`** — Meta tags e hints de performance
- Trocar `lang="en"` para `lang="pt-BR"`
- Title: "Fature 3vezes mais — Funil Automatico para Medicos e Advogados"
- Description: frase descritiva real do servico
- og:title, og:description, twitter:title, twitter:description atualizados
- Adicionar `<link rel="canonical" href="https://rebecab.lovable.app/" />`
- Adicionar `<meta name="theme-color" content="#222419" />`
- Adicionar `<link rel="dns-prefetch" href="https://scripts.converteai.net" />` e `<link rel="preconnect" href="https://scripts.converteai.net" />`
- Remover TODOs e autor "Lovable"

**2. `public/sitemap.xml`** — Novo arquivo
- Listar `/` e `/b` com lastmod e priority

**3. `public/robots.txt`** — Adicionar referencia ao sitemap
- `Sitemap: https://rebecab.lovable.app/sitemap.xml`

**4. `src/App.tsx`** — Lazy loading de rotas
- `React.lazy()` para `Admin`, `AdminLogin`, `NotFound`
- Envolver com `<Suspense>` para nao bloquear o bundle das paginas de vendas

**5. `src/pages/Index.tsx`** e `src/pages/IndexB.tsx`** — Otimizacao de imagem
- Adicionar `width` e `height` explicitos na tag `<img>` da hero (evita CLS)
- Adicionar `fetchPriority="high"` na imagem hero

### Arquivos editados
| Arquivo | Acao |
|---|---|
| `index.html` | Meta tags SEO, preconnect, theme-color, lang |
| `public/sitemap.xml` | Novo |
| `public/robots.txt` | Adicionar sitemap |
| `src/App.tsx` | Lazy loading rotas admin |
| `src/pages/Index.tsx` | width/height na img, fetchPriority |
| `src/pages/IndexB.tsx` | fetchPriority no background (preload hint) |

