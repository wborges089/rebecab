

## Exportar SQL completo para migração ao Supabase nativo

### O que será gerado

Um arquivo `.sql` único com toda a estrutura do banco atual, pronto para colar no SQL Editor de um novo projeto Supabase.

### Conteúdo do arquivo

1. **Enum** `app_role` (admin, moderator, user)
2. **Tabelas**: `sales_pages`, `leads`, `deals`, `traffic_entries`, `user_roles` — com colunas, defaults e tipos exatos
3. **RLS**: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + todas as 19 policies existentes
4. **Function**: `has_role(_user_id, _role)` security definer
5. **Realtime**: publication para tabelas que usam (se aplicável)
6. **Comentários** explicando cada seção

### Arquivo gerado

`/mnt/documents/database_schema.sql` — pronto para download

### Edge Functions (manual)

As Edge Functions (`submit-lead` e `classify-lead`) não fazem parte do SQL. Elas precisam ser copiadas manualmente para `supabase/functions/` no novo projeto e deployadas via CLI (`supabase functions deploy`). O código já está no repositório Git.

### Passos pós-exportação

1. Criar novo projeto no Supabase
2. Abrir SQL Editor → colar o conteúdo do `.sql` → executar
3. Copiar a pasta `supabase/functions/` para o novo projeto
4. Configurar os secrets (`LOVABLE_API_KEY`) no novo projeto
5. Atualizar as variáveis de ambiente no frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)

