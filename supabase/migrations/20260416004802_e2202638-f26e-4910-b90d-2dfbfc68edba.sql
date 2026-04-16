
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'outros',
  data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
  recorrente BOOLEAN NOT NULL DEFAULT false,
  mes_referencia TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own despesas" ON public.despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own despesas" ON public.despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own despesas" ON public.despesas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own despesas" ON public.despesas FOR DELETE USING (auth.uid() = user_id);
