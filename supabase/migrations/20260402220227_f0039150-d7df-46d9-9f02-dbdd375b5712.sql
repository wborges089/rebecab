
-- sales_pages table
CREATE TABLE public.sales_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  platform text NOT NULL DEFAULT 'instagram',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sales_pages" ON public.sales_pages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert sales_pages" ON public.sales_pages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sales_pages" ON public.sales_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sales_pages" ON public.sales_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- traffic_entries table
CREATE TABLE public.traffic_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_page_id uuid REFERENCES public.sales_pages(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  visits integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  platform text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.traffic_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view traffic_entries" ON public.traffic_entries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert traffic_entries" ON public.traffic_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update traffic_entries" ON public.traffic_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete traffic_entries" ON public.traffic_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  sales_page_id uuid REFERENCES public.sales_pages(id) ON DELETE SET NULL,
  title text NOT NULL,
  value numeric(12,2) NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'novo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view deals" ON public.deals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update deals" ON public.deals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add sales_page_id to leads
ALTER TABLE public.leads ADD COLUMN sales_page_id uuid REFERENCES public.sales_pages(id) ON DELETE SET NULL;
