import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivxmoyutgiybzrtifzdb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eG1veXV0Z2l5YnpydGlmemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjY5MzYsImV4cCI6MjA5MTY0MjkzNn0.FlJfUoquvTB6lVctECjzBq8th1grzbXy2gtoy6UaTV8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateData() {
  console.log('Efetuando login...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mestre@vanzeiro.com.br',
    password: 'mestrevanzeiro'
  });

  if (authError) {
    console.error('Erro no login:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Login realizado. ID:', userId);

  // 1. Criar Rotas
  console.log('Criando rotas...');
  const { data: rotas, error: rotaError } = await supabase.from('rotas').insert([
    { user_id: userId, nome: 'Rota Manhã - Centro', turno: 'manha' },
    { user_id: userId, nome: 'Rota Tarde - Escolas Norte', turno: 'tarde' }
  ]).select();

  if (rotaError) {
    console.error('Erro ao criar rotas:', rotaError.message);
    return;
  }

  const rotaIds = rotas.map(r => r.id);

  // 2. Criar 30 Alunos
  console.log('Criando 30 alunos...');
  const nomes = [
    'Pedro Santos', 'Julia Lima', 'Mateus Silva', 'Ana Oliveira', 'Lucas Ferreira',
    'Beatriz Costa', 'Gabriel Souza', 'Lara Rocha', 'Felipe Almeida', 'Mariana Gomes',
    'Henrique Silva', 'Isabela Pires', 'Gustavo Santos', 'Larissa Melo', 'Rafael Castro',
    'Camila Duarte', 'Thiago Mendes', 'Bianca Alves', 'Leonardo Nunes', 'Sofia Reis',
    'Nicolas Paz', 'Helena Moraes', 'Vitor Hugo', 'Alice Fernandes', 'Daniel Ribeiro',
    'Clara Machado', 'Samuel Porto', 'Emanuelly Dias', 'Joaquim Silva', 'Valentina Cruz'
  ];

  const escolas = ['Colégio Estadual', 'Escola Municipal Viva', 'Centro Educacional Saber', 'Instituto Pró-Saber'];

  const alunosData = nomes.map((nome, index) => ({
    user_id: userId,
    nome: nome,
    responsavel_nome: `Responsável de ${nome.split(' ')[0]}`,
    responsavel_whatsapp: '5511999999999',
    escola: escolas[index % escolas.length],
    turno: index % 2 === 0 ? 'manha' : 'tarde',
    rota_id: index % 2 === 0 ? rotaIds[0] : rotaIds[1],
    valor_mensalidade: 250 + (index * 10), // r$ 250 a r$ 540
    status: 'ativo'
  }));

  const { data: alunos, error: alunoError } = await supabase.from('alunos').insert(alunosData).select();

  if (alunoError) {
    console.error('Erro ao criar alunos:', alunoError.message);
    return;
  }

  // 3. Criar Mensalidades (Março e Abril 2026)
  console.log('Gerando mensalidades e inadimplência...');
  const mensalidades = [];

  alunos.forEach((aluno, index) => {
    // Março: A maioria pagou (25/30)
    mensalidades.push({
      aluno_id: aluno.id,
      user_id: userId,
      mes_referencia: '2026-03',
      valor: aluno.valor_mensalidade,
      status: index < 25 ? 'pago' : 'atrasado',
      data_pagamento: index < 25 ? '2026-03-05' : null
    });

    // Abril: Muitos em atraso para simular inadimplência (20/30)
    mensalidades.push({
      aluno_id: aluno.id,
      user_id: userId,
      mes_referencia: '2026-04',
      valor: aluno.valor_mensalidade,
      status: index < 10 ? 'pago' : 'pendente',
      data_pagamento: index < 10 ? '2026-04-02' : null
    });
  });

  const { error: mensError } = await supabase.from('mensalidades').insert(mensalidades);

  if (mensError) {
    console.error('Erro ao criar mensalidades:', mensError.message);
  } else {
    console.log('Dados populados com sucesso! 30 alunos e 60 mensalidades criadas.');
  }
}

populateData();
