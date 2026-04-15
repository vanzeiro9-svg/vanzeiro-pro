
CREATE TABLE public.escolas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own escolas" ON public.escolas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own escolas" ON public.escolas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own escolas" ON public.escolas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own escolas" ON public.escolas FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.turnos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own turnos" ON public.turnos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own turnos" ON public.turnos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own turnos" ON public.turnos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own turnos" ON public.turnos FOR DELETE USING (auth.uid() = user_id);
