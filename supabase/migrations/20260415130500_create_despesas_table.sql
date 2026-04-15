-- Despesas table
CREATE TABLE public.despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Combustivel', 'Manutenção', 'Salarios', 'Outros')),
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  data_despesa DATE NOT NULL DEFAULT CURRENT_DATE,
  fixa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_despesas_usuario_id ON public.despesas(usuario_id);
CREATE INDEX idx_despesas_data_despesa ON public.despesas(data_despesa);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own despesas"
  ON public.despesas
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own despesas"
  ON public.despesas
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own despesas"
  ON public.despesas
  FOR UPDATE
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own despesas"
  ON public.despesas
  FOR DELETE
  USING (auth.uid() = usuario_id);
