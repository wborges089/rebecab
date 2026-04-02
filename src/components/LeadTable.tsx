import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  source: string | null;
  lead_score: string | null;
  quiz_answers: Record<string, string | string[]> | null;
  created_at: string;
}

interface LeadTableProps {
  leads: Lead[];
}

const scoreColors: Record<string, string> = {
  quente: "bg-red-500/20 text-red-400 border-red-500/30",
  morno: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  frio: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const QUESTION_LABELS: Record<string, string> = {
  aquisicao: "Como consegue clientes",
  estrutura: "Estrutura de captação",
  faturamento: "Faturamento mensal",
  desafio: "Maior desafio",
  investimento: "Disposição para investir",
};

const LeadTable = ({ leads }: LeadTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-foreground">Nome</TableHead>
            <TableHead className="text-foreground hidden md:table-cell">Email</TableHead>
            <TableHead className="text-foreground hidden md:table-cell">WhatsApp</TableHead>
            <TableHead className="text-foreground">Origem</TableHead>
            <TableHead className="text-foreground">Score</TableHead>
            <TableHead className="text-foreground hidden md:table-cell">Data</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <>
              <TableRow key={lead.id} className="hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{lead.email}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell">{lead.whatsapp}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{lead.source || "direto"}</Badge>
                </TableCell>
                <TableCell>
                  {lead.lead_score ? (
                    <Badge className={scoreColors[lead.lead_score] || ""}>
                      {lead.lead_score.charAt(0).toUpperCase() + lead.lead_score.slice(1)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Pendente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                  {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  >
                    {expandedId === lead.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedId === lead.id && (
                <TableRow key={`${lead.id}-details`}>
                  <TableCell colSpan={7} className="bg-muted/10 p-4">
                    <div className="space-y-3">
                      <div className="md:hidden space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{lead.email}</span></p>
                        <p><span className="text-muted-foreground">WhatsApp:</span> <span className="text-foreground">{lead.whatsapp}</span></p>
                        <p><span className="text-muted-foreground">Data:</span> <span className="text-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span></p>
                      </div>
                      <p className="text-sm font-medium text-foreground">Respostas do Quiz:</p>
                      {lead.quiz_answers ? (
                        <div className="grid gap-2 text-sm">
                          {Object.entries(lead.quiz_answers).map(([key, val]) => (
                            <div key={key} className="flex flex-col sm:flex-row sm:gap-2">
                              <span className="text-muted-foreground font-medium min-w-[180px]">
                                {QUESTION_LABELS[key] || key}:
                              </span>
                              <span className="text-foreground">
                                {Array.isArray(val) ? val.join(", ") : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">Nenhuma resposta registrada</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Nenhum lead encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTable;
