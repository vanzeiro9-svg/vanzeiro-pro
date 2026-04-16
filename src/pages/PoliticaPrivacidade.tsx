import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à página inicial
        </Link>

        <h1 className="text-3xl font-black text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: abril de 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Quem somos</h2>
            <p>
              O Vanzeiro (“nós”) oferece software de gestão para transportadores escolares. Esta Política descreve como
              tratamos dados pessoais em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Dados que podemos coletar</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Cadastro e conta:</strong> nome, e-mail, telefone/WhatsApp, dados de autenticação e identificadores
                técnicos da sessão.
              </li>
              <li>
                <strong>Operação do serviço:</strong> dados de alunos, responsáveis, rotas, valores, documentos, frequência
                e demais informações que você inserir no aplicativo.
              </li>
              <li>
                <strong>Pagamentos:</strong> quando houver assinatura, dados de cobrança podem ser processados por
                provedores de pagamento (por exemplo, Stripe); não armazenamos integralmente dados de cartão em nossos
                servidores de aplicação.
              </li>
              <li>
                <strong>Logs e segurança:</strong> endereço IP, tipo de dispositivo, data/hora de acesso e registros de
                erro, para segurança e melhoria do serviço.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Finalidades e bases legais</h2>
            <p>
              Tratamos dados para: executar o contrato e fornecer o Serviço; cumprir obrigações legais; proteger
              segurança e prevenir fraudes; com base em legítimo interesse, melhorar o produto e comunicações
              relacionadas ao serviço; e, quando necessário, com seu consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Compartilhamento</h2>
            <p>
              Podemos compartilhar dados com prestadores essenciais à operação (hospedagem, banco de dados
              autenticado — por exemplo Supabase —, processamento de pagamentos), sempre sob obrigações contratuais de
              confidencialidade e segurança. Não vendemos seus dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Retenção</h2>
            <p>
              Mantemos os dados pelo tempo necessário para prestar o Serviço, cumprir obrigações legais e resolver
              disputas. Após exclusão da conta ou solicitação válida, podemos manter registros mínimos quando a lei
              exigir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Seus direitos (titular)</h2>
            <p>
              Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, anonimização,
              portabilidade, eliminação de dados desnecessários, informação sobre compartilhamentos e revogação de
              consentimento, quando aplicável. Para exercer direitos, use o canal de suporte ou e-mail de contato
              oficial do Vanzeiro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados. Nenhum sistema é 100% seguro;
              recomendamos usar senha forte e não compartilhar seu acesso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">8. Cookies e tecnologias similares</h2>
            <p>
              O aplicativo pode usar armazenamento local e cookies necessários à sessão e autenticação. Ajustes adicionais
              podem ser descritos conforme evolução do produto.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">9. Alterações desta Política</h2>
            <p>
              Podemos atualizar esta Política. A data no topo indica a última revisão. Alterações relevantes podem ser
              comunicadas no aplicativo ou por e-mail quando apropriado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">10. Encarregado (DPO)</h2>
            <p>
              Para questões sobre proteção de dados, entre em contato pelo canal indicado no aplicativo ou no site
              oficial do Vanzeiro. Indicaremos o encarregado de dados quando aplicável.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
