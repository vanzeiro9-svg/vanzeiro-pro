import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermosDeUso = () => {
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

        <h1 className="text-3xl font-black text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: abril de 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">1. Aceitação</h2>
            <p>
              Ao acessar ou usar o aplicativo e os serviços Vanzeiro (“Serviço”), você concorda com estes Termos de Uso.
              Se não concordar, não utilize o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">2. Descrição do serviço</h2>
            <p>
              O Vanzeiro é uma plataforma de gestão voltada a transportadores escolares, incluindo funcionalidades como
              cadastro de alunos, controle financeiro, documentos, frequência e comunicação com responsáveis, conforme
              disponibilizado em cada versão do aplicativo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">3. Conta e cadastro</h2>
            <p>
              Você deve fornecer informações verdadeiras e manter sua conta segura. Você é responsável por todas as
              atividades realizadas com seu login. Notifique-nos imediatamente em caso de uso não autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">4. Uso permitido</h2>
            <p>
              É proibido utilizar o Serviço de forma ilegal, para prejudicar terceiros, violar direitos, disseminar
              malware, tentar acessar áreas não autorizadas ou sobrecarregar a infraestrutura. O descumprimento pode
              resultar em suspensão ou encerramento da conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">5. Assinatura e pagamentos</h2>
            <p>
              Quando aplicável, planos pagos são cobrados conforme condições exibidas no momento da contratação
              (incluindo período de teste e cancelamento). Pagamentos podem ser processados por parceiros (por exemplo,
              Stripe). Taxas e impostos podem ser aplicados conforme legislação vigente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">6. Conteúdo e dados do usuário</h2>
            <p>
              Você mantém a titularidade dos dados que inserir no Serviço, observadas as licenças necessárias para
              operarmos a plataforma, conforme descrito na Política de Privacidade. Você declara ter legitimidade para
              tratar dados de alunos e responsáveis na medida em que os cadastrar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">7. Disponibilidade e alterações</h2>
            <p>
              Empregamos esforços razoáveis para manter o Serviço disponível, mas não garantimos disponibilidade
              ininterrupta. Podemos alterar funcionalidades, estes Termos ou encerrar o Serviço com aviso prévio quando
              razoável, exceto em casos urgentes de segurança ou conformidade legal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">8. Limitação de responsabilidade</h2>
            <p>
              Na medida permitida pela lei aplicável, o Vanzeiro não se responsabiliza por danos indiretos, lucros
              cessantes ou perdas de dados decorrentes do uso ou impossibilidade de uso do Serviço. O uso é por sua conta
              e risco, dentro dos limites legais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">9. Lei e foro</h2>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de
              domicílio do consumidor, quando aplicável o Código de Defesa do Consumidor, ou outro foro competente
              conforme a legislação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-2">10. Contato</h2>
            <p>
              Dúvidas sobre estes Termos podem ser enviadas pelo canal de suporte indicado no aplicativo ou no site
              oficial do Vanzeiro.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermosDeUso;
