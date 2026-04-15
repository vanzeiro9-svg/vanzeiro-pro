import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivxmoyutgiybzrtifzdb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eG1veXV0Z2l5YnpydGlmemRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjY5MzYsImV4cCI6MjA5MTY0MjkzNn0.FlJfUoquvTB6lVctECjzBq8th1grzbXy2gtoy6UaTV8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMasterUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'mestre@vanzeiro.com.br',
    password: 'mestrevanzeiro',
    options: {
      data: {
        nome: 'Mestre Vanzeiro',
      }
    }
  });

  if (error) {
    console.error('Erro ao criar usuário:', error.message);
  } else {
    console.log('Usuário criado com sucesso:', data.user?.email);
    console.log('ID do Usuário:', data.user?.id);
  }
}

createMasterUser();
