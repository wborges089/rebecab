import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Globe, ArrowLeft, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type SalesPage = {
  id: string;
  name: string;
  url: string | null;
  platform: string;
  created_at: string;
};

type TrafficEntry = {
  id: string;
  sales_page_id: string;
  date: string;
  visits: number;
  clicks: number;
  cost: number;
  platform: string | null;
  created_at: string;
};

const SalesPages = () => {
  const [pages, setPages] = useState<SalesPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<SalesPage | null>(null);
  const [trafficEntries, setTrafficEntries] = useState<TrafficEntry[]>([]);
  const [leadCount, setLeadCount] = useState(0);

  // New page form
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState("instagram");

  // Traffic form
  const [tDate, setTDate] = useState(new Date().toISOString().split("T")[0]);
  const [tVisits, setTVisits] = useState("");
  const [tClicks, setTClicks] = useState("");
  const [tCost, setTCost] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data } = await supabase.from("sales_pages").select("*").order("created_at", { ascending: false });
    if (data) setPages(data as SalesPage[]);
    setLoading(false);
  };

  const handleCreatePage = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("sales_pages").insert({ name: newName, url: newUrl || null, platform: newPlatform });
    if (error) { toast.error("Erro ao criar página"); return; }
    toast.success("Página criada!");
    setDialogOpen(false);
    setNewName(""); setNewUrl(""); setNewPlatform("instagram");
    fetchPages();
  };

  const handleDeletePage = async (id: string) => {
    const { error } = await supabase.from("sales_pages").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Página excluída");
    fetchPages();
  };

  const openPageDetails = async (page: SalesPage) => {
    setSelectedPage(page);
    const { data: traffic } = await supabase.from("traffic_entries").select("*").eq("sales_page_id", page.id).order("date", { ascending: false });
    setTrafficEntries((traffic || []) as TrafficEntry[]);
    const { count } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("sales_page_id", page.id);
    setLeadCount(count || 0);
  };

  const handleAddTraffic = async () => {
    if (!selectedPage) return;
    const { error } = await supabase.from("traffic_entries").insert({
      sales_page_id: selectedPage.id,
      date: tDate,
      visits: parseInt(tVisits) || 0,
      clicks: parseInt(tClicks) || 0,
      cost: parseFloat(tCost) || 0,
      platform: selectedPage.platform,
    });
    if (error) { toast.error("Erro ao registrar tráfego"); return; }
    toast.success("Tráfego registrado!");
    setTVisits(""); setTClicks(""); setTCost("");
    openPageDetails(selectedPage);
  };

  const totalVisits = trafficEntries.reduce((s, e) => s + e.visits, 0);
  const totalClicks = trafficEntries.reduce((s, e) => s + e.clicks, 0);
  const totalCost = trafficEntries.reduce((s, e) => s + Number(e.cost), 0);

  if (selectedPage) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPage(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{selectedPage.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedPage.url}</p>
          </div>
          <Badge>{selectedPage.platform}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{totalVisits}</p><p className="text-xs text-muted-foreground">Visitas</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{totalClicks}</p><p className="text-xs text-muted-foreground">Cliques</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">R$ {totalCost.toFixed(2)}</p><p className="text-xs text-muted-foreground">Custo Total</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{leadCount}</p><p className="text-xs text-muted-foreground">Leads</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Registrar Tráfego</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="bg-white text-gray-900" />
              <Input placeholder="Visitas" value={tVisits} onChange={(e) => setTVisits(e.target.value)} className="bg-white text-gray-900" />
              <Input placeholder="Cliques" value={tClicks} onChange={(e) => setTClicks(e.target.value)} className="bg-white text-gray-900" />
              <Input placeholder="Custo (R$)" value={tCost} onChange={(e) => setTCost(e.target.value)} className="bg-white text-gray-900" />
            </div>
            <Button className="mt-2" size="sm" onClick={handleAddTraffic}>Adicionar</Button>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Data</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trafficEntries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{new Date(e.date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{e.visits}</TableCell>
                  <TableCell>{e.clicks}</TableCell>
                  <TableCell>R$ {Number(e.cost).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {trafficEntries.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum registro</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-foreground">Páginas de Vendas</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" /> Nova Página</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => openPageDetails(page)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{page.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{page.url || "Sem URL"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">{page.platform}</Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pages.length === 0 && !loading && (
          <p className="text-muted-foreground col-span-full text-center py-8">Nenhuma página cadastrada</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Página de Vendas</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome da página" value={newName} onChange={(e) => setNewName(e.target.value)} className="bg-white text-gray-900" />
            <Input placeholder="URL (ex: https://...)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="bg-white text-gray-900" />
            <Select value={newPlatform} onValueChange={setNewPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePage}>Criar Página</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPages;
