

## Dashboard com Graficos + Menu Lateral no Admin

### Mudancas

**1. Layout: Tabs superiores → Sidebar lateral**

Substituir o layout atual (header + Tabs) por um layout com `SidebarProvider` + `Sidebar` do shadcn. O sidebar tera 4 itens:
- Dashboard (novo — graficos de visao geral)
- Leads
- Paginas de Vendas
- CRM

No mobile, o sidebar colapsa e um `SidebarTrigger` fica visivel no header. Botao "Sair" vai para o rodape do sidebar.

**2. Nova secao Dashboard com graficos**

Componente `AdminDashboard.tsx` com:
- **Grafico de linha**: evolucao de leads captados por dia (ultimos 30 dias), agrupados por `created_at`
- **Grafico de barras**: trafego (visitas + cliques) por dia, dados de `traffic_entries`
- **Grafico de pizza**: distribuicao de leads por score (quente/morno/frio)
- **Cards resumo**: total leads, total visitas, custo total, deals em aberto
- Filtro de periodo (7d, 15d, 30d)

Usa `recharts` (ja instalado via shadcn chart) com `ChartContainer` e `ChartTooltipContent`.

**3. Reestruturacao do Admin.tsx**

Em vez de Tabs, usa estado `activeSection` controlado pelo sidebar. Cada secao renderiza o componente correspondente. Auth check permanece igual.

### Arquivos

| Arquivo | Acao |
|---|---|
| `src/pages/Admin.tsx` | Reescrever: SidebarProvider + Sidebar + conteudo por secao |
| `src/components/AdminSidebar.tsx` | Novo: sidebar com navegacao e logout |
| `src/components/AdminDashboard.tsx` | Novo: graficos de leads e trafego com recharts |

### Detalhes tecnicos

- Graficos usam `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` de `@/components/ui/chart`
- Recharts: `LineChart`, `BarChart`, `PieChart` do pacote `recharts` (ja disponivel)
- Dados agrupados no frontend por dia usando reduce sobre `leads` e `traffic_entries`
- Sidebar com `collapsible="icon"` para modo mini no mobile

