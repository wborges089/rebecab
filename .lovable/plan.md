

## Painel Admin: Paginas de Vendas, Trafego e CRM

### Escopo

Transformar o admin atual (apenas lista de leads) em um painel completo com 3 abas:
1. **Leads** — o que ja existe
2. **Paginas de Vendas** — cadastro de paginas + metricas de trafego
3. **CRM** — pipeline Kanban + visao tabela com valores de negociacao

### Sobre a integracao Meta/Google Ads

A integracao direta com Meta Ads e Google Ads exige credenciais OAuth e apps aprovados nessas plataformas, o que e um processo demorado. Como primeira versao, vou implementar **entrada manual dos dados de trafego** (visitas, cliques, custo, plataforma) para cada pagina. Futuramente podemos adicionar integracao via API.

---

### 1. Novas tabelas no banco

**`sales_pages`** — paginas de vendas cadastradas
- `id` (uuid), `name` (text), `url` (text), `platform` (text — instagram, google, facebook, etc), `created_at`

**`traffic_entries`** — registros de trafego por pagina/periodo
- `id` (uuid), `sales_page_id` (fk), `date` (date), `visits` (int), `clicks` (int), `cost` (numeric), `platform` (text), `created_at`

**`deals`** — negociacoes do CRM
- `id` (uuid), `lead_id` (fk para leads), `sales_page_id` (fk opcional), `title` (text), `value` (numeric), `stage` (text — novo, em_negociacao, proposta, fechado, perdido), `notes` (text), `created_at`, `updated_at`

Todas com RLS permitindo apenas admins (usando `has_role`).

Adicionar coluna `sales_page_id` (nullable, fk) na tabela `leads` para associar leads a paginas.

### 2. Layout do Admin com abas

Reestruturar `Admin.tsx` usando `Tabs` (ja disponivel no projeto):
- **Aba Leads** — conteudo atual (contadores + filtros + tabela)
- **Aba Paginas** — CRUD de paginas + metricas de trafego por pagina
- **Aba CRM** — Kanban + tabela de deals

### 3. Aba Paginas de Vendas

**Componente `SalesPages.tsx`:**
- Lista de paginas cadastradas em cards
- Botao "Nova Pagina" abre dialog com campos: nome, URL, plataforma
- Ao clicar numa pagina, mostra:
  - Metricas resumidas (total visitas, custo, leads captados daquela pagina)
  - Formulario para adicionar entrada de trafego (data, visitas, cliques, custo)
  - Tabela com historico de entradas

### 4. Aba CRM

**Componente `CrmPipeline.tsx`:**
- Toggle entre visao Kanban e visao Tabela
- **Kanban**: colunas por stage (Novo, Em Negociacao, Proposta, Fechado, Perdido) com cards arrastáveis mostrando nome do lead, valor e pagina de origem
- **Tabela**: lista de deals com colunas (Lead, Pagina, Valor, Stage, Data) + totalizador de valor por stage
- Botao "Novo Deal" associa um lead existente, define valor e stage
- Editar stage e valor inline ou via dialog

### 5. Arquivos criados/editados

| Arquivo | Acao |
|---|---|
| Migration SQL | Criar tabelas `sales_pages`, `traffic_entries`, `deals` + RLS |
| `src/pages/Admin.tsx` | Adicionar Tabs (Leads, Paginas, CRM) |
| `src/components/SalesPages.tsx` | CRUD paginas + metricas trafego |
| `src/components/TrafficEntryForm.tsx` | Form para registrar trafego |
| `src/components/CrmPipeline.tsx` | Kanban + tabela de deals |
| `src/components/DealCard.tsx` | Card do deal no Kanban |
| `src/components/DealDialog.tsx` | Dialog para criar/editar deal |
| `src/components/LeadTable.tsx` | Sem alteracao |

### Detalhes tecnicos

- Drag-and-drop no Kanban usando `@dnd-kit/core` (leve, sem dependencias pesadas)
- Totalizadores calculados no frontend a partir dos dados carregados
- Leads associados a paginas via `sales_page_id` (nullable para retrocompatibilidade)
- Todas as queries protegidas por RLS admin

