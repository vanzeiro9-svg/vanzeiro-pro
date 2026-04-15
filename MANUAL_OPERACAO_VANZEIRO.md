# Manual de Operacao do Vanzeiro

Este manual foi feito para motoristas e gestores que querem usar o Vanzeiro no dia a dia, sem complicacao.

---

## 1) Como fazer cadastro e login

### Criar conta (primeiro acesso)

1. Acesse a tela de cadastro em `/auth/signup`.
2. Preencha os campos:
   - **Nome**
   - **E-mail**
   - **WhatsApp**
   - **Senha** (minimo 6 caracteres)
3. Clique no botao **Criar Conta**.
4. Apos o cadastro, voce sera redirecionado para a tela de plano (`/planos`).

### Entrar na conta (login)

1. Acesse `/auth/login`.
2. Digite seu **e-mail** e **senha**.
3. Clique no botao **Entrar**.
4. Se os dados estiverem corretos, voce entra no **Dashboard**.

---

## 2) Como gerenciar assinatura (Stripe)

O Vanzeiro usa o Stripe para cobranca segura.

### Ativar assinatura

1. Acesse a pagina de planos (`/planos`).
2. Clique no botao **Ativar Assinatura**.
3. Voce sera levado para o checkout seguro do Stripe.
4. Finalize o pagamento para liberar acesso completo.

### Reativar assinatura vencida

Se sua assinatura nao estiver ativa, o sistema mostra um **Paywall** por cima do Dashboard (fundo desfocado).

1. No card central, clique em **Reativar Agora**.
2. O checkout abre com o cupom de reativacao aplicado automaticamente (quando configurado).
3. Conclua o pagamento para voltar ao uso normal.

### Gerenciar cartao, cancelamento e dados de cobranca

1. Entre em **Configuracoes**.
2. Va ate o bloco **Minha Assinatura**.
3. Clique em **Gerenciar Assinatura**.
4. O sistema gera um link seguro para o **Stripe Customer Portal**.
5. No portal, voce pode:
   - trocar cartao,
   - atualizar forma de pagamento,
   - cancelar assinatura.

---

## 3) Como cadastrar, editar e excluir alunos

Tudo isso e feito na tela **Alunos** (`/alunos`).

### Cadastrar aluno

1. Clique no botao **Novo**.
2. Preencha os dados do aluno:
   - nome do aluno,
   - responsavel,
   - WhatsApp do responsavel,
   - endereco de embarque/desembarque,
   - escola,
   - turno,
   - mensalidade,
   - rota (quando houver).
3. Clique em **Cadastrar aluno**.

### Editar aluno

1. Na lista de alunos, clique no card do aluno desejado.
2. O sistema abre a ficha completa.
3. Altere os campos necessarios.
4. Clique em **Salvar Alteracoes**.

### Excluir aluno

1. Abra a ficha do aluno (clicando no card dele).
2. Clique em **Excluir**.
3. Confirme em **Confirmar Exclusao**.

> Atencao: a exclusao remove o aluno e pode impactar historico financeiro vinculado.

---

## 4) Como lancar despesas e categorias

### Situacao atual no sistema

Atualmente, o projeto ja possui a tabela `despesas` no Supabase (com categorias), e o Dashboard ja usa esses valores no calculo financeiro.  
**Ainda nao existe uma tela de cadastro de despesas no app.**

### Como lancar despesas hoje (via Supabase)

1. Abra seu projeto no **Supabase Dashboard**.
2. Entre em **Table Editor** > tabela **despesas**.
3. Clique em **Insert row** (inserir linha).
4. Preencha:
   - `descricao` (ex: Troca de oleo)
   - `categoria` (uma destas):
     - `Combustivel`
     - `Manutenção`
     - `Salarios`
     - `Outros`
   - `valor` (ex: 350.00)
   - `data_despesa` (data da despesa)
   - `fixa` (`true` para despesa recorrente, `false` para avulsa)
5. Salve a linha.

> O campo `usuario_id` e protegido por RLS e deve ficar ligado ao usuario autenticado.

---

## 5) Como interpretar os numeros do Dashboard

No Dashboard (`/dashboard`), voce ve 4 indicadores principais:

### Receita Bruta

- Soma das mensalidades com status **pago**.
- Mostra quanto realmente entrou.

### Despesas Totais

- Soma dos valores registrados na tabela **despesas**.
- Mostra quanto saiu.

### Lucro Liquido

- Formula: **Receita Bruta - Despesas Totais**.
- Se positivo: voce fechou com ganho.
- Se negativo: suas despesas passaram sua receita.

### Inadimplencia

- Soma das mensalidades com status **atrasado**.
- Representa valor vencido e ainda nao recebido.

### Grafico Receitas vs Despesas

- Compara visualmente entrada e saida.
- Se a barra de Despesas estiver maior que Receitas, o lucro tende a cair ou ficar negativo.

---

## 6) Fluxo recomendado de uso diario

1. Entrar no Dashboard e conferir **Lucro Liquido** e **Inadimplencia**.
2. Ir em **Financeiro** (`/mensalidades`) para:
   - gerar cobrancas do mes,
   - marcar pagamentos recebidos,
   - cobrar pelo botao **Zap**.
3. Ir em **Alunos** para manter cadastro atualizado.
4. Ir em **Configuracoes** para:
   - atualizar dados do perfil/veiculo,
   - manter escolas, rotas e turnos,
   - gerenciar assinatura.

---

## 7) Dicas praticas

- Sempre revise a **chave Pix** em Configuracoes antes de cobrar no WhatsApp.
- Use nomes de escola/rota/turno padronizados para evitar duplicidade.
- Marque pagamento no mesmo dia para manter Dashboard confiavel.
- Em caso de bloqueio por assinatura, reative direto no botao **Reativar Agora**.

