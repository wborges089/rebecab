import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TypebotQuiz from "@/components/TypebotQuiz";
import { CheckCircle2 } from "lucide-react";

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormComplete?: () => void;
}

const getSource = (): string => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  if (utmSource) return utmSource;
  const path = window.location.pathname;
  if (path === "/b") return "pagina_b";
  if (path === "/") return "pagina_a";
  return "direto";
};

type Phase = "form" | "quiz" | "success";

const LeadCaptureDialog = ({ open, onOpenChange, onFormComplete }: LeadCaptureDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatWhatsApp(e.target.value));
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidWhatsApp = (wp: string) => wp.replace(/\D/g, "").length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: "Preencha seu nome", variant: "destructive" });
      return;
    }
    if (!isValidEmail(email)) {
      toast({ title: "Digite um email válido", variant: "destructive" });
      return;
    }
    if (!isValidWhatsApp(whatsapp)) {
      toast({ title: "Digite um WhatsApp válido", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const source = getSource();
    const id = crypto.randomUUID();

    const { data, error } = await supabase.functions.invoke("submit-lead", {
      body: { name: name.trim(), email: email.trim(), whatsapp: whatsapp.replace(/\D/g, ""), source },
    });

    if (error || !data?.id) {
      toast({ title: "Erro ao enviar dados. Tente novamente.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    setLeadId(data.id);
    setPhase("quiz");
    setIsSubmitting(false);
  };

  const handleQuizComplete = async (answers: Record<string, string | string[]>) => {
    if (!leadId) return;

    supabase.functions.invoke("classify-lead", {
      body: { leadId, quizAnswers: answers },
    }).catch((err) => console.error("Classification error:", err));

    setPhase("success");
    onFormComplete?.();
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setPhase("form");
      setName("");
      setEmail("");
      setWhatsapp("");
      setLeadId(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        {phase === "success" ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
            <DialogTitle className="text-2xl font-bold text-foreground">Obrigado, {name.split(" ")[0]}! 🎉</DialogTitle>
            <p className="text-muted-foreground text-base leading-relaxed">
              Recebemos seus dados com sucesso!<br />
              Nossa equipe vai entrar em contato em breve pelo WhatsApp.
            </p>
            <p className="text-muted-foreground text-sm">
              Fique de olho no seu celular 📱
            </p>
            <Button onClick={() => handleClose(false)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Fechar
            </Button>
          </div>
        ) : phase === "quiz" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg md:text-xl font-bold text-foreground text-center">
                Só mais algumas perguntas rápidas 🚀
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground text-sm">
                Nos ajude a entender seu momento para personalizar sua experiência.
              </DialogDescription>
            </DialogHeader>
            <TypebotQuiz onComplete={handleQuizComplete} />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-bold text-foreground text-center">
                Garanta sua vaga agora!
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground text-sm">
                Preencha seus dados abaixo para garantir acesso exclusivo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="bg-white border-border text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  className="bg-white border-border text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-foreground">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={whatsapp}
                  onChange={handleWhatsAppChange}
                  className="bg-white border-border text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                {isSubmitting ? "Enviando..." : "Quero Garantir Minha Vaga"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
