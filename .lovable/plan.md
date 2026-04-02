

## Questionario Interativo + Backoffice com IA

### 1. Questionario Interativo (estilo Typebot)

Apos o lead preencher nome/email/WhatsApp, em vez da tela de sucesso, inicia um fluxo de perguntas uma por vez com animacao de transicao suave (slide/fade). Cada pergunta ocupa a tela inteira do dialog.

**Componente `TypebotQuiz`** — exibe uma pergunta por vez com opcoes clicaveis (cards/botoes). Ao clicar, avanca automaticamente para a proxima. Progresso visual no topo (barra ou dots).

**Perguntas:**
1. Como consegue novos pacientes/clientes? (selecao unica)
2. Estrutura de captacao funcionando? (multipla selecao + botao "Continuar")
3. Faturamento mensal atual? (selecao unica)
4. Maior desafio para crescer? (selecao unica)
5. Disposto a investir? (selecao unica)

Ao finalizar, salva as respostas junto com o lead no Supabase e exibe a tela de sucesso.

### 2. Supabase — Tabelas

- **`leads`** — id, name, email, whatsapp, source (utm_source ou pathname: "instagram", "pagina_a", "pagina_b"), quiz_answers (jsonb), lead_score (text: "frio"/"morno"/"quente"), created_at
- **`user_roles`** — para controle de acesso admin ao backoffice (seguindo o padrao de seguranca com enum + funcao `has_role`)

**Origem do lead**: capturada automaticamente via `utm_source` da URL (ex: `?utm_source=instagram`) ou pelo pathname (`/` = pagina A, `/b` = pagina B). Salva no campo `source`.

### 3. Classificacao com IA (Lovable AI)

Edge function `classify-lead` que recebe as respostas do quiz e usa Lovable AI para classificar o lead como Frio, Morno ou Quente com base nas respostas. Salva o resultado no campo `lead_score` da tabela `leads`.

Criterios gerais para a IA:
- Quente: faturamento alto + disposto a investir + desafio claro
- Morno: tem estrutura parcial + interesse mas com ressalvas
- Frio: sem estrutura + sem interesse imediato

### 4. Backoffice (`/admin`)

- **Pagina de login** simples com email/senha (Supabase Auth)
- **Dashboard protegido** com:
  - Tabela de leads com colunas: Nome, Email, WhatsApp, Origem, Score (tag colorida), Data
  - Filtros por score (Frio/Morno/Quente) e por origem
  - Contadores no topo (total leads, quentes, mornos, frios)
  - Expandir lead para ver respostas completas do quiz

### 5. Arquivos a criar/editar

**Novos:**
- `src/components/TypebotQuiz.tsx` — questionario interativo
- `src/pages/Admin.tsx` — dashboard do backoffice
- `src/pages/AdminLogin.tsx` — login do admin
- `src/components/LeadTable.tsx` — tabela de leads
- `supabase/functions/classify-lead/index.ts` — classificacao com IA
- Migration: tabelas `leads`, `user_roles`, RLS policies

**Editados:**
- `src/components/LeadCaptureDialog.tsx` — apos submit, inicia o quiz em vez de mostrar sucesso. Captura `utm_source` e pathname como origem
- `src/App.tsx` — adicionar rotas `/admin` e `/admin/login`

### 6. Fluxo completo

```text
Visitante chega (com utm_source ou via /b)
  → Assiste video → Clica CTA
  → Preenche nome/email/WhatsApp
  → Quiz interativo (5 perguntas, uma por vez)
  → Dados salvos no Supabase
  → Edge function classifica lead com IA
  → Tela de sucesso

Admin acessa /admin
  → Login com email/senha
  → Dashboard com leads, scores e filtros
```

