import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Lead = { id: string; name: string; email: string };
type SalesPage = { id: string; name: string };

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  deal?: {
    id: string;
    lead_id: string | null;
    sales_page_id: string | null;
    title: string;
    value: number;
    stage: string;
    notes: string | null;
  } | null;
}

const STAGES = [
  { value: "novo", label: "Novo" },
  { value: "em_negociacao", label: "Em Negociação" },
  { value: "proposta", label: "Proposta" },
  { value: "fechado", label: "Fechado" },
  { value: "perdido", label: "Perdido" },
];

const DealDialog = ({ open, onOpenChange, onSaved, deal }: DealDialogProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [salesPages, setSalesPages] = useState<SalesPage[]>([]);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState("novo");
  const [leadId, setLeadId] = useState<string>("");
  const [pageId, setPageId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      if (deal) {
        setTitle(deal.title);
        setValue(String(deal.value));
        setStage(deal.stage);
        setLeadId(deal.lead_id || "");
        setPageId(deal.sales_page_id || "");
        setNotes(deal.notes || "");
      } else {
        setTitle(""); setValue(""); setStage("novo"); setLeadId(""); setPageId(""); setNotes("");
      }
    }
  }, [open, deal]);

  const fetchData = async () => {
    const [{ data: l }, { data: p }] = await Promise.all([
      supabase.from("leads").select("id, name, email").order("created_at", { ascending: false }),
      supabase.from("sales_pages").select("id, name"),
    ]);
    setLeads((l || []) as Lead[]);
    setSalesPages((p || []) as SalesPage[]);
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Informe o título"); return; }
    setSaving(true);
    const payload = {
      title,
      value: parseFloat(value) || 0,
      stage,
      lead_id: leadId || null,
      sales_page_id: pageId || null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    if (deal) {
      const { error } = await supabase.from("deals").update(payload).eq("id", deal.id);
      if (error) { toast.error("Erro ao atualizar"); setSaving(false); return; }
      toast.success("Deal atualizado!");
    } else {
      const { error } = await supabase.from("deals").insert(payload);
      if (error) { toast.error("Erro ao criar deal"); setSaving(false); return; }
      toast.success("Deal criado!");
    }
    setSaving(false);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{deal ? "Editar Deal" : "Novo Deal"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white text-gray-900" />
          <Input placeholder="Valor (R$)" type="number" value={value} onChange={(e) => setValue(e.target.value)} className="bg-white text-gray-900" />
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger><SelectValue placeholder="Associar lead (opcional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.email}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={pageId} onValueChange={setPageId}>
            <SelectTrigger><SelectValue placeholder="Página de vendas (opcional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma</SelectItem>
              {salesPages.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-white text-gray-900" />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealDialog;
