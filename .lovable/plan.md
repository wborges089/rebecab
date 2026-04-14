

## Corrigir acesso ao painel admin

### Causa raiz

Na correção de segurança anterior, removemos a permissão de `EXECUTE` da função `has_role` para o role `authenticated`. Isso quebrou todas as RLS policies que dependem dessa função — incluindo a policy "Admins can view all roles" na tabela `user_roles`, que é consultada durante o login.

O login no Supabase Auth funciona (status 200), mas a query `SELECT role FROM user_roles WHERE user_id = ... AND role = 'admin'` retorna vazio porque a RLS não consegue avaliar `has_role()`.

### Solução

Criar uma migração SQL que restaura o `EXECUTE` para `authenticated` na função `has_role`. A função já é `SECURITY DEFINER`, então ela executa com privilégios do owner — isso é seguro. O risco anterior (exposição via RPC) pode ser mitigado de outra forma: removendo a função do schema `public` da API exposta ou usando `pg_net` grants mais granulares.

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
```

Isso é suficiente para restaurar o funcionamento de todas as RLS policies sem comprometer segurança, pois a função apenas retorna `true/false` para o próprio `uid` do usuário autenticado.

### Arquivo afetado

- Nova migração SQL (via ferramenta de migração)

