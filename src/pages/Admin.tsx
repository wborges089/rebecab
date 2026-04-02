import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminSidebar from "@/components/AdminSidebar";
import AdminDashboard from "@/components/AdminDashboard";
import LeadTable from "@/components/LeadTable";
import SalesPages from "@/components/SalesPages";
import CrmPipeline from "@/components/CrmPipeline";

type Lead = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  source: string | null;
  lead_score: string | null;
  quiz_answers: Record<string, string | string[]> | null;
  created_at: string;
};

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterScore, setFilterScore] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!roles || roles.length === 0) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      fetchLeads();
    };
    checkAuth();
  }, [navigate]);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin/login"); };

  const filteredLeads = leads.filter((l) => {
    if (filterScore && l.lead_score !== filterScore) return false;
    if (filterSource && l.source !== filterSource) return false;
    return true;
  });

  const counts = {
    total: leads.length,
    quente: leads.filter((l) => l.lead_score === "quente").length,
    morno: leads.filter((l) => l.lead_score === "morno").length,
    frio: leads.filter((l) => l.lead_score === "frio").length,
  };

  const uniqueSources = [...new Set(leads.map((l) => l.source || "direto"))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border px-4">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
          </header>
          <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
            {activeSection === "dashboard" && <AdminDashboard />}

            {activeSection === "leads" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground">Leads</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{counts.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-400">{counts.quente}</p>
                    <p className="text-xs text-muted-foreground">Quentes 🔥</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">{counts.morno}</p>
                    <p className="text-xs text-muted-foreground">Mornos</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{counts.frio}</p>
                    <p className="text-xs text-muted-foreground">Frios</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant={filterScore === null ? "default" : "outline"} size="sm" onClick={() => setFilterScore(null)}>Todos</Button>
                  {["quente", "morno", "frio"].map((s) => (
                    <Button key={s} variant={filterScore === s ? "default" : "outline"} size="sm" onClick={() => setFilterScore(filterScore === s ? null : s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Button>
                  ))}
                  <span className="border-l border-border mx-2" />
                  {uniqueSources.map((src) => (
                    <Badge key={src} variant={filterSource === src ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilterSource(filterSource === src ? null : src)}>
                      {src}
                    </Badge>
                  ))}
                </div>

                <LeadTable leads={filteredLeads} />
              </div>
            )}

            {activeSection === "pages" && <SalesPages />}
            {activeSection === "crm" && <CrmPipeline />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
