import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import heroPhoto from "@/assets/photo-hero.png";

const REVEAL_SECONDS = 60;

const IndexB = () => {
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
      {/* Hero with background photo */}
      <div
        className="relative w-full min-h-[50vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroPhoto})`, backgroundPosition: 'center top' }}
      >
        <div className="absolute inset-0 bg-background/50" />
        <div className="relative z-10 text-center px-4 py-16 space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight">
            Descubra o Método que está{" "}
            <span className="text-primary">Transformando Resultados</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Assista ao vídeo completo e descubra como você pode começar ainda hoje.
          </p>
        </div>
      </div>

      {/* Video + CTA */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl space-y-8">
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

export default IndexB;
