import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import heroPhoto from "@/assets/photo-hero.png";

const REVEAL_SECONDS = 300;

const VTURB_SCRIPT_URL = "https://scripts.converteai.net/ed0d119e-2b6d-499b-a28e-3c65bc0897aa/players/69cfbb1ff5c99568d7aea569/v4/player.js";
const VTURB_PLAYER_ID = "vid-69cfbb1ff5c99568d7aea569";

const Index = () => {
  const [showCTA, setShowCTA] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formCompleted, setFormCompleted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Load Vturb script
  useEffect(() => {
    if (document.querySelector(`script[src="${VTURB_SCRIPT_URL}"]`)) return;
    const s = document.createElement("script");
    s.src = VTURB_SCRIPT_URL;
    s.async = true;
    document.head.appendChild(s);
  }, []);

  // Reveal CTA after REVEAL_SECONDS
  useEffect(() => {
    const timer = setTimeout(() => setShowCTA(true), REVEAL_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 px-4 pt-12 pb-6 max-w-5xl mx-auto w-full">
        <div className="flex-1 text-center lg:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            Fature 3 vezes mais em seu consultório com{" "}
            <span className="text-primary">funil de aquisição de lead automático</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
            Assista ao vídeo completo e descubra como você pode começar ainda hoje.
          </p>
        </div>
        <div className="flex-shrink-0">
          <img
            src={heroPhoto}
            alt="Especialista"
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover object-top border-4 border-primary shadow-xl"
          />
        </div>
      </div>

      {/* Video + CTA or Thank You */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        {formCompleted ? (
          <div className="w-full max-w-3xl text-center space-y-6 py-12">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Obrigado por se cadastrar! 🎉
            </h2>
            <p className="text-muted-foreground text-lg">
              Nossa equipe vai entrar em contato em breve pelo WhatsApp.<br />
              Fique de olho no seu celular 📱
            </p>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-8">
            {/* Vturb Player */}
            <div ref={playerRef} className="w-full rounded-xl overflow-hidden border border-border shadow-2xl">
              <div
                dangerouslySetInnerHTML={{
                  __html: `<vturb-smartplayer id="${VTURB_PLAYER_ID}" style="display:block;margin:0 auto;width:100%;"></vturb-smartplayer>`
                }}
              />
            </div>

            {/* CTA Button */}
            <div className="flex flex-col items-center gap-3 min-h-[80px]">
              {!showCTA && (
                <p className="text-muted-foreground text-sm animate-pulse">
                  Continue assistindo... uma oferta especial está chegando ⏳
                </p>
              )}
              <div
                className={`transition-all duration-700 ${
                  showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <Button
                  id="cta-btn"
                  size="lg"
                  onClick={() => setDialogOpen(true)}
                  className="text-lg md:text-xl px-10 py-7 font-bold bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow rounded-xl"
                >
                  🔥 Quero Começar Agora
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} onFormComplete={() => setFormCompleted(true)} />
    </div>
  );
};

export default Index;
