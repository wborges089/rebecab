

## Diagnóstico e Correção do Formulário de Cadastro

### Problema identificado
Os logs do console não mostram erros de submissão, o que indica que o formulário pode estar falhando silenciosamente ou o botão de submit não está disparando corretamente no mobile (viewport 390px).

### Possíveis causas
1. O insert no banco pode estar falhando sem feedback visual adequado ao usuário
2. O botão "Quero Garantir Minha Vaga" com `animate-pulse-glow` pode estar com algum conflito de CSS que impede o clique no mobile
3. O estado de loading não existe — se o usuário clica duas vezes, pode causar erro de email duplicado

### Correções planejadas

**`src/components/LeadCaptureDialog.tsx`**:
- Adicionar estado `isSubmitting` para desabilitar o botão durante o envio e evitar duplo-clique
- Adicionar `console.log` antes e depois do insert para capturar o erro exato nos logs
- Melhorar feedback de erro com a mensagem real do Supabase no toast
- Garantir que o botão submit funcione corretamente removendo `animate-pulse-glow` do botão dentro do dialog (pode interferir com pointer events)

### Detalhes técnicos

```typescript
// Adicionar estado de loading
const [isSubmitting, setIsSubmitting] = useState(false);

// No handleSubmit:
setIsSubmitting(true);
console.log("Submitting lead...", { name, email, whatsapp, source });

const { error } = await supabase.from("leads").insert({...});

if (error) {
  console.error("Insert error:", JSON.stringify(error));
  setIsSubmitting(false);
  // mostrar error.message no toast
  return;
}

// No botão:
disabled={isSubmitting}
// Texto muda para "Enviando..." enquanto submete
```

### Arquivo editado
- `src/components/LeadCaptureDialog.tsx`

