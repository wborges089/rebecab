import { lazy, Suspense, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import IndexB from "./pages/IndexB.tsx";

const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const getSubdomain = () => {
  const hostname = window.location.hostname;
  if (hostname.includes("funilpacientesa")) return "funilpacientesa"
  if (hostname.includes("funilpacientesb")) return "funilpacientesb";
  if (hostname.includes("admin")) return "admin";
  return null;
};

const App = () => {
  const subdomain = useMemo(() => getSubdomain(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>}>
            <Routes>
              {subdomain === "funilpacientesa" && (
                <Route path="*" element={<Index />} />
              )}
              {subdomain === "funilpacientesb" && (
                <Route path="*" element={<IndexB />} />
              )}
                            {subdomain === "admin" && <Route path="/" element={<Navigate to="/admin/login" replace />} />}
                                          {subdomain === "admin" && <Route path="/admin" element={<Admin />} />}
                                                        {subdomain === "admin" && <Route path="/admin/login" element={<AdminLogin />} />}
                                                                      {subdomain === "admin" && <Route path="*" element={<NotFound />} />}
                                                                                    {!subdomain && <Route path="/" element={<Index />} />}
                                                                                                  {!subdomain && <Route path="/b" element={<IndexB />} />}
                                                                                                                {!subdomain && <Route path="/admin" element={<Admin />} />}
                                                                                                                              {!subdomain && <Route path="/admin/login" element={<AdminLogin />} />}
                                                                                                                                            {!subdomain && <Route path="*" element={<NotFound />} />}
                                                                                                                                            Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
