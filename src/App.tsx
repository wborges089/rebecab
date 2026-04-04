import { lazy, Suspense, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
  if (hostname.includes("paginaa")) return "paginaa";
  if (hostname.includes("paginab")) return "paginab";
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
              {subdomain === "paginaa" && (
                <Route path="*" element={<Index />} />
              )}
              {subdomain === "paginab" && (
                <Route path="*" element={<IndexB />} />
              )}
              {subdomain === "admin" && (
                <>
                  <Route path="/" element={<Admin />} />
                  <Route path="/login" element={<AdminLogin />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
              {!subdomain && (
                <>
                  <Route path="/" element={<Index />} />
                  <Route path="/b" element={<IndexB />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="*" element={<NotFound />} />
                </>
              )}
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
