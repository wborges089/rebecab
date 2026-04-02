import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import heroPhoto from "@/assets/photo-hero.png";

const REVEAL_SECONDS = 60;

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying || showCTA) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= REVEAL_SECONDS) {
          setShowCTA(true);
          clearInterval(interval);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, showCTA]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero section */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 px-4 pt-12 pb-6 max-w-5xl mx-auto w-full">
        <div className="flex-1 text-center lg:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            Descubra o Método que Está{" "}
            <span className="text-primary">Transformando Resultados</span>
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

      {/* Video + CTA */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-3xl space-y-8">
          {/* Video Player Placeholder */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/80 backdrop-blur-sm cursor-pointer group transition-all"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
                <span className="text-muted-foreground text-sm">Clique para assistir</span>
              </button>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground text-sm">Reproduzindo vídeo...</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-3 min-h-[80px]">
            {isPlaying && !showCTA && (
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
                size="lg"
                onClick={() => setDialogOpen(true)}
                className="text-lg md:text-xl px-10 py-7 font-bold bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse-glow rounded-xl"
              >
                🔥 Quero Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Index;
