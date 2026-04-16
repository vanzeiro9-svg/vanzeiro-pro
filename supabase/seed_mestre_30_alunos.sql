-- Seed de demonstração: 30 alunos +2 rotas + mensalidades (mês atual e anterior)
-- para o usuário mestre@vanzeiro.com.br
--
-- Como rodar: Supabase Dashboard → SQL Editor → colar e executar.
-- Pré-requisito: usuário mestre@vanzeiro.com.br já criado em Authentication → Users.
--
-- Se você recriou o usuário mestre no Auth, o UUID mudou: os alunos antigos ficaram
-- ligados ao id antigo e somem no app. Rode este script de novo — a limpeza abaixo
-- apaga qualquer "Aluno Sim %" / "Rota Sim %" (de qualquer user_id) e recria para o mestre atual.

DO $$
DECLARE
  v_user uuid;
  v_rota_manha uuid;
  v_rota_tarde uuid;
  v_aluno_id uuid;
  i int;
  mes_atual text := to_char(current_date, 'YYYY-MM');
  mes_anterior text := to_char((current_date - interval '1 month')::date, 'YYYY-MM');
  valor numeric(10,2);
  st text;
  turno_aluno text;
  rota_escolhida uuid;
BEGIN
  SELECT id INTO v_user
  FROM auth.users
  WHERE lower(trim(email)) = 'mestre@vanzeiro.com.br'
  LIMIT 1;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Crie primeiro o usuário mestre@vanzeiro.com.br em Authentication → Users.';
  END IF;

  -- Limpa simulação pelo nome (qualquer user_id), para não sobrar órfãos após recriar o mestre no Auth
  DELETE FROM public.mensalidades
  WHERE aluno_id IN (SELECT id FROM public.alunos WHERE nome LIKE 'Aluno Sim %');

  DELETE FROM public.frequencias
  WHERE aluno_id IN (SELECT id FROM public.alunos WHERE nome LIKE 'Aluno Sim %');

  DELETE FROM public.alunos WHERE nome LIKE 'Aluno Sim %';

  DELETE FROM public.rotas WHERE nome LIKE 'Rota Sim %';

  INSERT INTO public.rotas (user_id, nome, turno)
  VALUES (v_user, 'Rota Sim - Manhã', 'manha')
  RETURNING id INTO v_rota_manha;

  INSERT INTO public.rotas (user_id, nome, turno)
  VALUES (v_user, 'Rota Sim - Tarde', 'tarde')
  RETURNING id INTO v_rota_tarde;

  FOR i IN 1..30 LOOP
    turno_aluno := CASE WHEN i % 2 = 0 THEN 'manha' ELSE 'tarde' END;
    rota_escolhida := CASE WHEN turno_aluno = 'manha' THEN v_rota_manha ELSE v_rota_tarde END;
    valor := 350.00 + (i * 12.50);

    INSERT INTO public.alunos (
      user_id,
      nome,
      responsavel_nome,
      responsavel_whatsapp,
      endereco_embarque,
      endereco_desembarque,
      escola,
      turno,
      valor_mensalidade,
      status,
      data_inicio,
      rota_id,
      ordem_embarque
    )
    VALUES (
      v_user,
      'Aluno Sim ' || lpad(i::text, 2, '0'),
      'Responsável Sim ' || lpad(i::text, 2, '0'),
      '1199999' || lpad(i::text, 4, '0'),
      'Rua do Embarque, ' || i || '00 - Centro',
      'Av. da Escola, ' || i || '50 - Bairro Novo',
      CASE (i % 3)
        WHEN 0 THEN 'EM João Simão'
        WHEN 1 THEN 'EM Maria Simões'
        ELSE 'EM Pedro Simulação'
      END,
      turno_aluno::text,
      valor,
      'ativo',
      (current_date - (i % 12) * interval '1 month')::date,
      rota_escolhida,
      i
    )
    RETURNING id INTO v_aluno_id;

    -- Mês anterior: parte paga, parte atrasada
    st := CASE (i % 3)
      WHEN 0 THEN 'pago'
      WHEN 1 THEN 'pendente'
      ELSE 'atrasado'
    END;

    INSERT INTO public.mensalidades (aluno_id, user_id, mes_referencia, valor, status, data_pagamento)
    VALUES (
      v_aluno_id,
      v_user,
      mes_anterior,
      valor,
      st,
      CASE WHEN st = 'pago' THEN (current_date - 10)::date ELSE NULL END
    );

    -- Mês atual: outra distribuição para variar dashboard / inadimplência
    st := CASE (i % 4)
      WHEN 0 THEN 'pago'
      WHEN 1 THEN 'pago'
      WHEN 2 THEN 'pendente'
      ELSE 'atrasado'
    END;

    INSERT INTO public.mensalidades (aluno_id, user_id, mes_referencia, valor, status, data_pagamento)
    VALUES (
      v_aluno_id,
      v_user,
      mes_atual,
      valor,
      st,
      CASE WHEN st = 'pago' THEN (current_date - 2)::date ELSE NULL END
    );
  END LOOP;

  RAISE NOTICE 'Seed concluído: 30 alunos (Aluno Sim 01–30), 2 rotas e mensalidades em % e %.', mes_anterior, mes_atual;
END $$;
