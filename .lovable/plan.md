

## Preparar o Projeto para Deploy em Subdomínios na Hostinger

### Situação atual

O projeto é um SPA único com React Router. Todas as páginas (A, B, Admin) estão no mesmo bundle. Para subdomínios independentes na Hostinger, cada um precisa funcionar como uma aplicação standalone que serve `index.html` na raiz `/`.

### Abordagem: Detecção de subdomínio no Router

Em vez de criar 3 builds separados (o que complicaria a manutenção), a abordagem mais prática é manter um único build e usar detecção de subdomínio no `App.tsx` para renderizar a página correta.

**Estrutura de subdomínios:**
- `paginaa.seudominio.com` → Página A (Index)
- `paginab.seudominio.com` → Página B (IndexB)
- `admin.seudominio.com` → Admin + AdminLogin

### Alterações

**1. `src/App.tsx`** — Detectar subdomínio e renderizar rotas condicionais

```text
hostname = window.location.hostname

Se contém "paginaa" → renderiza só <Index /> na raiz
Se contém "paginab" → renderiza só <IndexB /> na raiz
Se contém "admin"   → renderiza <AdminLogin /> em /login e <Admin /> em /
Default (localhost)  → mantém todas as rotas como hoje
```

**2. `index.html`** — Nenhuma alteração necessária (cada subdomínio servirá o mesmo `index.html`)

**3. Configuração na Hostinger** — Você fará isso manualmente:
- Criar 3 subdomínios apontando para a mesma pasta de build (ou 3 cópias do `dist/`)
- Configurar redirecionamento SPA (404 → index.html) em cada subdomínio

### Arquivos editados
| Arquivo | Ação |
|---|---|
| `src/App.tsx` | Lógica de detecção de subdomínio no router |

### Alternativa: 3 builds separados

Se preferir builds totalmente independentes (bundles menores por subdomínio), seria necessário criar 3 entry points HTML e 3 configs Vite. Isso reduz o tamanho do bundle por subdomínio mas triplica a complexidade de manutenção. A abordagem de detecção de subdomínio é mais simples e recomendada.

