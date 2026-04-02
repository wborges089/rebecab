import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  multiSelect?: boolean;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "aquisicao",
    question: "Hoje, como você consegue novos pacientes/clientes?",
    options: [
      "Indicação",
      "Instagram / redes sociais",
      "Tráfego pago",
      "Não tenho estratégia definida",
    ],
  },
  {
    id: "estrutura",
    question: "Você já possui alguma estrutura de captação funcionando?",
    options: [
      "Página de captura / site",
      "CRM (Kommo, RD, etc.)",
      "Tráfego pago ativo",
      "Equipe (secretária, comercial, social media)",
      "Não tenho nada estruturado",
    ],
    multiSelect: true,
  },
  {
    id: "faturamento",
    question: "Qual é o seu faturamento mensal atual com atendimentos e serviços?",
    options: ["Até R$10 mil", "R$10k – R$30k", "R$30k – R$80k", "+R$80k"],
  },
  {
    id: "desafio",
    question: "Hoje, qual é o seu maior desafio para crescer?",
    options: [
      "Falta de pacientes/clientes",
      "Falta de previsibilidade",
      "Baixa conversão",
      "Dependência de indicação",
      "Falta de tempo/estrutura",
    ],
  },
  {
    id: "investimento",
    question:
      "Você está disposto(a) a investir para estruturar um funil previsível de captação com estratégia e equipe?",
    options: [
      "Sim, quero escalar com previsibilidade",
      "Sim, mas preciso entender melhor",
      "Não tenho interesse agora",
    ],
  },
];

interface TypebotQuizProps {
  onComplete: (answers: Record<string, string | string[]>) => void;
}

const TypebotQuiz = ({ onComplete }: TypebotQuizProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [multiSelections, setMultiSelections] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);

  const question = QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUESTIONS.length) * 100;

  const advance = (updatedAnswers: Record<string, string | string[]>) => {
    setAnimating(true);
    setTimeout(() => {
      if (currentIndex < QUESTIONS.length - 1) {
        setCurrentIndex((i) => i + 1);
        setMultiSelections([]);
      } else {
        onComplete(updatedAnswers);
      }
      setAnimating(false);
    }, 300);
  };

  const handleSingleSelect = (option: string) => {
    const updated = { ...answers, [question.id]: option };
    setAnswers(updated);
    advance(updated);
  };

  const handleMultiToggle = (option: string) => {
    setMultiSelections((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleMultiContinue = () => {
    if (multiSelections.length === 0) return;
    const updated = { ...answers, [question.id]: multiSelections };
    setAnswers(updated);
    advance(updated);
  };

  return (
    <div className="space-y-6 py-2">
      <Progress value={progress} className="h-2" />

      <p className="text-xs text-muted-foreground text-center">
        Pergunta {currentIndex + 1} de {QUESTIONS.length}
      </p>

      <div
        className={cn(
          "transition-all duration-300",
          animating ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"
        )}
      >
        <h3 className="text-lg font-semibold text-foreground text-center mb-5 leading-snug">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.multiSelect
            ? question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleMultiToggle(option)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm",
                    multiSelections.includes(option)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50 hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={multiSelections.includes(option)}
                      className="pointer-events-none"
                    />
                    <span>{option}</span>
                  </div>
                </button>
              ))
            : question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSingleSelect(option)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border bg-secondary/50 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-foreground transition-all text-sm"
                >
                  {option}
                </button>
              ))}
        </div>

        {question.multiSelect && (
          <Button
            onClick={handleMultiContinue}
            disabled={multiSelections.length === 0}
            className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  );
};

export default TypebotQuiz;
