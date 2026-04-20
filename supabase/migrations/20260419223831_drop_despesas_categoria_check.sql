-- Remove constraint de categoria para permitir categorias dinâmicas
ALTER TABLE public.despesas DROP CONSTRAINT IF EXISTS despesas_categoria_check;
