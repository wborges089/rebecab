import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Users, Eye, DollarSign, Handshake } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from "recharts";

type Lead = { id: string; created_at: string; lead_score: string | null };
type TrafficEntry = { date: string; visits: number; clicks: number; cost: number };
type Deal = { id: string; value: number; stage: string };

const PERIOD_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "15d", days: 15 },
  { label: "30d", days: 30 },
];

const SCORE_COLORS: Record<string, string> = {
  quente: "hsl(0 72% 51%)",
  morno: "hsl(45 93% 47%)",
  frio: "hsl(210 79% 46%)",
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<TrafficEntry[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const fetchAll = async () => {
      const since = new Date();
      since.setDate(since.getDate() - period);
      const sinceStr = since.toISOString();

      const [leadsRes, trafficRes, dealsRes] = await Promise.all([
        supabase.from("leads").select("id, created_at, lead_score").gte("created_at", sinceStr),
        supabase.from("traffic_entries").select("date, visits, clicks, cost").gte("date", since.toISOString().split("T")[0]),
        supabase.from("deals").select("id, value, stage"),
      ]);

      if (leadsRes.data) setLeads(leadsRes.data);
      if (trafficRes.data) setTraffic(trafficRes.data as TrafficEntry[]);
      if (dealsRes.data) setDeals(dealsRes.data as Deal[]);
    };
    fetchAll();
  }, [period]);

  const leadsByDay = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      const day = l.created_at.split("T")[0];
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), leads: count }));
  }, [leads]);

  const trafficByDay = useMemo(() => {
    const map: Record<string, { visits: number; clicks: number }> = {};
    traffic.forEach((t) => {
      const day = t.date;
      if (!map[day]) map[day] = { visits: 0, clicks: 0 };
      map[day].visits += t.visits;
      map[day].clicks += t.clicks;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date: date.slice(5), ...vals }));
  }, [traffic]);

  const scoreDistribution = useMemo(() => {
    const map: Record<string, number> = { quente: 0, morno: 0, frio: 0 };
    leads.forEach((l) => {
      const score = l.lead_score || "frio";
      map[score] = (map[score] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const totalVisits = traffic.reduce((s, t) => s + t.visits, 0);
  const totalCost = traffic.reduce((s, t) => s + t.cost, 0);
  const openDeals = deals.filter((d) => !["fechado", "perdido"].includes(d.stage));
  const openDealsValue = openDeals.reduce((s, d) => s + Number(d.value), 0);

  const lineChartConfig = { leads: { label: "Leads", color: "hsl(var(--primary))" } };
  const barChartConfig = {
    visits: { label: "Visitas", color: "hsl(210 79% 46%)" },
    clicks: { label: "Cliques", color: "hsl(150 60% 40%)" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((p) => (
            <Button
              key={p.days}
              variant={period === p.days ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.days)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalVisits}</p>
              <p className="text-xs text-muted-foreground">Visitas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {totalCost.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Custo Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Handshake className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {openDealsValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">{openDeals.length} Deals Abertos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Leads por dia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
              <LineChart data={leadsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tráfego por dia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tráfego por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
              <BarChart data={trafficByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="visits" fill="hsl(210 79% 46%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" fill="hsl(150 60% 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição de score */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuição de Leads por Qualidade</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[250px] w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {scoreDistribution.map((entry) => (
                      <Cell key={entry.name} fill={SCORE_COLORS[entry.name] || "hsl(var(--muted))"} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
