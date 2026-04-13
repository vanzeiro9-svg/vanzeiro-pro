-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Rotas table
CREATE TABLE public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'integral')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rotas" ON public.rotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rotas" ON public.rotas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rotas" ON public.rotas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rotas" ON public.rotas FOR DELETE USING (auth.uid() = user_id);

-- Alunos table
CREATE TABLE public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  responsavel_nome TEXT NOT NULL,
  responsavel_whatsapp TEXT NOT NULL,
  endereco_embarque TEXT NOT NULL DEFAULT '',
  endereco_desembarque TEXT NOT NULL DEFAULT '',
  escola TEXT NOT NULL DEFAULT '',
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'integral')),
  valor_mensalidade NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'desistente')),
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  rota_id UUID REFERENCES public.rotas(id) ON DELETE SET NULL,
  ordem_embarque INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alunos" ON public.alunos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alunos" ON public.alunos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alunos" ON public.alunos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alunos" ON public.alunos FOR DELETE USING (auth.uid() = user_id);

-- Mensalidades table
CREATE TABLE public.mensalidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mes_referencia TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'atrasado')),
  data_pagamento DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mensalidades" ON public.mensalidades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mensalidades" ON public.mensalidades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mensalidades" ON public.mensalidades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mensalidades" ON public.mensalidades FOR DELETE USING (auth.uid() = user_id);

-- Documentos table
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  arquivo_url TEXT,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'vencendo', 'vencido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documentos" ON public.documentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documentos" ON public.documentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documentos" ON public.documentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documentos" ON public.documentos FOR DELETE USING (auth.uid() = user_id);

-- Frequencias table
CREATE TABLE public.frequencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'presente' CHECK (status IN ('presente', 'ausente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, data)
);

ALTER TABLE public.frequencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own frequencias" ON public.frequencias FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own frequencias" ON public.frequencias FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own frequencias" ON public.frequencias FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own frequencias" ON public.frequencias FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);

CREATE POLICY "Users can view own document files" ON storage.objects FOR SELECT USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload document files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own document files" ON storage.objects FOR UPDATE USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own document files" ON storage.objects FOR DELETE USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);
