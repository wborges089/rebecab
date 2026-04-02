import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LayoutGrid, List, GripVertical, Pencil } from "lucide-react";
import { toast } from "sonner";
import DealDialog from "./DealDialog";

type Deal = {
  id: string;
  lead_id: string | null;
  sales_page_id: string | null;
  title: string;
  value: number;
  stage: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Lead = { id: string; name: string };
type SalesPage = { id: string; name: string };

const STAGES = [
  { value: "novo", label: "Novo", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "em_negociacao", label: "Em Negociação", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "proposta", label: "Proposta", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "fechado", label: "Fechado", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "perdido", label: "Perdido", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const CrmPipeline = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Record<string, Lead>>({});
  const [salesPages, setSalesPages] = useState<Record<string, SalesPage>>({});
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [{ data: d }, { data: l }, { data: p }] = await Promise.all([
      supabase.from("deals").select("*").order("created_at", { ascending: false }),
      supabase.from("leads").select("id, name"),
      supabase.from("sales_pages").select("id, name"),
    ]);
    setDeals((d || []) as Deal[]);
    const leadMap: Record<string, Lead> = {};
    (l || []).forEach((x: any) => { leadMap[x.id] = x; });
    setLeads(leadMap);
    const pageMap: Record<string, SalesPage> = {};
    (p || []).forEach((x: any) => { pageMap[x.id] = x; });
    setSalesPages(pageMap);
    setLoading(false);
  };

  const handleStageChange = async (dealId: string, newStage: string) => {
    const { error } = await supabase.from("deals").update({ stage: newStage, updated_at: new Date().toISOString() }).eq("id", dealId);
    if (error) { toast.error("Erro ao atualizar"); return; }
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d));
  };

  const stageTotal = (stage: string) => deals.filter((d) => d.stage === stage).reduce((s, d) => s + Number(d.value), 0);

  const getLeadName = (id: string | null) => id && leads[id] ? leads[id].name : "—";
  const getPageName = (id: string | null) => id && salesPages[id] ? salesPages[id].name : "—";

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant={view === "kanban" ? "default" : "outline"} size="sm" onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
          </Button>
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <List className="h-4 w-4 mr-1" /> Tabela
          </Button>
        </div>
        <Button size="sm" onClick={() => { setEditingDeal(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo Deal
        </Button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {STAGES.map((s) => (
          <div key={s.value} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">R$ {stageTotal(s.value).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {view === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage.value);
            return (
              <div key={stage.value} className="min-w-[260px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={stage.color}>{stage.label}</Badge>
                  <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                </div>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">{getLeadName(deal.lead_id)}</p>
                            {deal.sales_page_id && <p className="text-xs text-muted-foreground">{getPageName(deal.sales_page_id)}</p>}
                          </div>
                          <p className="text-sm font-bold text-foreground">R$ {Number(deal.value).toFixed(0)}</p>
                        </div>
                        <div className="mt-2">
                          <Select value={deal.stage} onValueChange={(v) => handleStageChange(deal.id, v)}>
                            <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="border border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground">Vazio</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Título</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="hidden md:table-cell">Página</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const stageInfo = STAGES.find((s) => s.value === deal.stage);
                return (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium text-foreground">{deal.title}</TableCell>
                    <TableCell className="text-muted-foreground">{getLeadName(deal.lead_id)}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{getPageName(deal.sales_page_id)}</TableCell>
                    <TableCell className="font-medium text-foreground">R$ {Number(deal.value).toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={deal.stage} onValueChange={(v) => handleStageChange(deal.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(deal.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {deals.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum deal cadastrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DealDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={fetchAll} deal={editingDeal} />
    </div>
  );
};

export default CrmPipeline;
