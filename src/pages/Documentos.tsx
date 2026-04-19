import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, History, FileText, ExternalLink, Filter, X, Camera, AlertTriangle, CheckCircle2, Clock, ShieldAlert, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

// ─── Configuração dos 11 documentos (ordem alfabética) ───────────────────────
type SugestaoTipo = null | '+6m' | '+12m' | '+24m' | '+30m' | '+60m' | 'placa';

interface DocConfig {
  tipo: string;
  categoria: 'motorista' | 'veiculo';
  periodicidade: string;
  sugestao: SugestaoTipo;
}

const DOCUMENTOS_CONFIG: DocConfig[] = [
  { tipo: 'Alvará Municipal',        categoria: 'veiculo',   periodicidade: 'Anual',                sugestao: '+12m'  },
  { tipo: 'ATE (Condutor)',          categoria: 'motorista', periodicidade: 'Anual',                sugestao: '+12m'  },
  { tipo: 'Autorização do Veículo',  categoria: 'veiculo',   periodicidade: 'Anual',                sugestao: '+12m'  },
  { tipo: 'CNH (com EAR)',           categoria: 'motorista', periodicidade: 'Conforme documento',   sugestao: null    },
  { tipo: 'CRLV (Licenciamento)',    categoria: 'veiculo',   periodicidade: 'Anual',                sugestao: 'placa' },
  { tipo: 'Curso Especializado',     categoria: 'motorista', periodicidade: 'A cada 5 anos',        sugestao: '+60m'  },
  { tipo: 'Exame Toxicológico',      categoria: 'motorista', periodicidade: 'A cada 2 anos e meio', sugestao: '+30m'  },
  { tipo: 'Extintor (Recarga)',      categoria: 'veiculo',   periodicidade: 'Anual',                sugestao: '+12m'  },
  { tipo: 'Inmetro (Tacógrafo)',     categoria: 'veiculo',   periodicidade: 'A cada 2 anos',        sugestao: '+24m'  },
  { tipo: 'Seguro APP',              categoria: 'veiculo',   periodicidade: 'Anual',                sugestao: '+12m'  },
  { tipo: 'Vistoria Semestral',      categoria: 'veiculo',   periodicidade: 'A cada 6 meses',       sugestao: '+6m'   },
];

// ─── Status ──────────────────────────────────────────────────────────────────
type StatusInfo = {
  key: 'pendente' | 'analise' | 'valido' | 'vencer' | 'vencido';
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
};

function getStatusInfo(dataVenc: string | null, temFoto: boolean): StatusInfo {
  if (!dataVenc) {
    if (temFoto) return { key: 'analise', label: 'Em Análise', bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200',  icon: <Clock        className="w-3 h-3" /> };
    return           { key: 'pendente', label: 'Pendente',    bg: 'bg-slate-50',  text: 'text-slate-500', border: 'border-slate-200', icon: <FileText     className="w-3 h-3" /> };
  }
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const venc = new Date(dataVenc + 'T00:00:00');
  const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0)   return { key: 'vencido', label: 'Vencido',   bg: 'bg-red-50',   text: 'text-red-700',   border: 'border-red-300',   icon: <ShieldAlert   className="w-3 h-3" /> };
  if (dias <= 30) return { key: 'vencer',  label: 'A Vencer',  bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', icon: <AlertTriangle className="w-3 h-3" /> };
  return           { key: 'valido',  label: 'Válido',    bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', icon: <CheckCircle2  className="w-3 h-3" /> };
}

function sugerirData(sugestao: SugestaoTipo): string {
  if (!sugestao || sugestao === 'placa') return '';
  const meses = parseInt(sugestao.replace('+', '').replace('m', ''));
  const resultado = new Date();
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado.toISOString().slice(0, 10);
}

// ─── Componente principal ─────────────────────────────────────────────────────
const Documentos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const filtroCritico = searchParams.get('filtro') === 'criticos';

  const [modalAberto, setModalAberto] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // ─── Query de documentos ───────────────────────────────────────────────────
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['documentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // ─── Último registro por tipo ──────────────────────────────────────────────
  const latestByTipo = useMemo(() => {
    const map: Record<string, any> = {};
    documentos.forEach((d: any) => {
      if (!map[d.tipo] || new Date(d.created_at) > new Date(map[d.tipo].created_at)) {
        map[d.tipo] = d;
      }
    });
    return map;
  }, [documentos]);

  // ─── Contadores ────────────────────────────────────────────────────────────
  const { validos, criticos } = useMemo(() => {
    let validos = 0; let criticos = 0;
    DOCUMENTOS_CONFIG.forEach(cfg => {
      const doc = latestByTipo[cfg.tipo];
      const s = getStatusInfo(doc?.data_vencimento ?? null, !!doc?.arquivo_url);
      if (s.key === 'valido') validos++;
      if (s.key === 'vencido' || s.key === 'vencer') criticos++;
    });
    return { validos, criticos };
  }, [latestByTipo]);

  const progressoPct = Math.round((validos / DOCUMENTOS_CONFIG.length) * 100);
  const temVencido = DOCUMENTOS_CONFIG.some(cfg => getStatusInfo(latestByTipo[cfg.tipo]?.data_vencimento ?? null, false).key === 'vencido');
  const progressoCor = validos === DOCUMENTOS_CONFIG.length ? 'bg-green-500' : temVencido ? 'bg-red-500' : 'bg-amber-400';

  // ─── Upload mutation ───────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!tipoSelecionado) throw new Error('Selecione o tipo do documento.');
      let arquivo_url: string | null = null;
      if (file) {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('documentos').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(fileName);
        arquivo_url = publicUrl;
      }
      const status = getStatusInfo(dataVencimento || null, !!arquivo_url);
      const statusDb = status.key === 'vencido' ? 'vencido' : status.key === 'vencer' ? 'vencendo' : 'ok';
      const { error } = await supabase.from('documentos').insert({
        user_id: user!.id, tipo: tipoSelecionado,
        data_vencimento: dataVencimento || null,
        arquivo_url, status: statusDb,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setModalAberto(false); setTipoSelecionado(''); setDataVencimento(''); setFile(null); setUploading(false);
      toast({ title: 'Documento salvo!' });
    },
    onError: (error: any) => {
      setUploading(false);
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    },
  });

  const onSelecionarTipo = (tipo: string) => {
    setTipoSelecionado(tipo);
    const cfg = DOCUMENTOS_CONFIG.find(c => c.tipo === tipo);
    setDataVencimento(cfg?.sugestao && cfg.sugestao !== 'placa' ? sugerirData(cfg.sugestao) : '');
  };

  const abrirModalPara = (tipo: string) => { onSelecionarTipo(tipo); setFile(null); setModalAberto(true); };

  const docsFiltrados = filtroCritico
    ? DOCUMENTOS_CONFIG.filter(cfg => { const s = getStatusInfo(latestByTipo[cfg.tipo]?.data_vencimento ?? null, !!latestByTipo[cfg.tipo]?.arquivo_url); return s.key === 'vencido' || s.key === 'vencer'; })
    : DOCUMENTOS_CONFIG;

  const getHistorico = (tipo: string) =>
    documentos.filter((d: any) => d.tipo === tipo).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Documentação e Detran</h1>
          <p className="text-xs text-muted-foreground">Evite multas e apreensões</p>
        </div>
        <button
          onClick={() => { setTipoSelecionado(''); setDataVencimento(''); setFile(null); setModalAberto(true); }}
          className="flex items-center gap-1.5 bg-[#C9A84C] hover:bg-[#b8943e] text-white font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all active:scale-95"
        >
          <Upload className="w-4 h-4" /> Enviar Foto
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-foreground">Documentação: {validos}/11 em dia</span>
          <span className="text-xs font-semibold text-muted-foreground">{progressoPct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progressoCor}`} style={{ width: `${progressoPct}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{validos} válidos</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />{criticos} atenção</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />{11 - validos - criticos} pendentes</span>
        </div>
      </div>

      {/* Filtro crítico */}
      {criticos > 0 && (
        <div className="mb-3">
          {filtroCritico ? (
            <button onClick={() => setSearchParams({})} className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200 transition-colors">
              <X className="w-3.5 h-3.5" /> Limpar filtro (mostrando {docsFiltrados.length} críticos)
            </button>
          ) : (
            <button onClick={() => setSearchParams({ filtro: 'criticos' })} className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors">
              <Filter className="w-3.5 h-3.5" /> Ver só os {criticos} críticos
            </button>
          )}
        </div>
      )}

      {/* Lista de documentos */}
      {isLoading ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando documentos...</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {docsFiltrados.map((cfg) => {
            const doc = latestByTipo[cfg.tipo];
            const status = getStatusInfo(doc?.data_vencimento ?? null, !!doc?.arquivo_url);
            const historico = getHistorico(cfg.tipo);
            const isImagem = doc?.arquivo_url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(doc.arquivo_url);
            return (
              <div key={cfg.tipo} className={`bg-white rounded-2xl border ${status.border} shadow-sm overflow-hidden`}>
                <div className="flex items-start gap-3 p-3.5">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center border border-slate-200">
                    {isImagem ? (
                      <img src={doc.arquivo_url} alt={cfg.tipo} className="w-full h-full object-cover" />
                    ) : doc?.arquivo_url ? (
                      <FileText className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-foreground leading-tight">{cfg.tipo}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{cfg.periodicidade}</p>
                      </div>
                      <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
                        {status.icon} {status.label.toUpperCase()}
                      </span>
                    </div>
                    {doc?.data_vencimento && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Vence: <span className="font-semibold text-foreground">{new Date(doc.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        {(() => {
                          const now = new Date(); now.setHours(0,0,0,0);
                          const venc = new Date(doc.data_vencimento + 'T00:00:00');
                          const dias = Math.ceil((venc.getTime() - now.getTime()) / (1000*60*60*24));
                          if (dias < 0) return <span className="ml-1 font-bold text-red-600">({Math.abs(dias)}d atrás)</span>;
                          if (dias <= 30) return <span className="ml-1 font-bold text-amber-600">(em {dias}d)</span>;
                          return null;
                        })()}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => abrirModalPara(cfg.tipo)} className="text-[11px] font-bold text-[#C9A84C] hover:text-[#b8943e] transition-colors">
                        {doc ? 'Enviar Nova Foto' : '+ Cadastrar'}
                      </button>
                      {doc?.arquivo_url && (
                        <a href={doc.arquivo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[11px] font-bold text-primary hover:underline">
                          <ExternalLink className="w-3 h-3" /> Ver
                        </a>
                      )}
                      {historico.length > 1 && <HistoricoModal tipo={cfg.tipo} historico={historico} />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de upload */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-slate-900">Enviar Documento</h2>
                <button onClick={() => setModalAberto(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }} className="space-y-4">
                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Tipo do documento</Label>
                  <select
                    value={tipoSelecionado}
                    onChange={e => onSelecionarTipo(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    required
                  >
                    <option value="">Selecione o documento...</option>
                    <optgroup label="Motorista">
                      {DOCUMENTOS_CONFIG.filter(c => c.categoria === 'motorista').map(c => (
                        <option key={c.tipo} value={c.tipo}>{c.tipo}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Veículo">
                      {DOCUMENTOS_CONFIG.filter(c => c.categoria === 'veiculo').map(c => (
                        <option key={c.tipo} value={c.tipo}>{c.tipo}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                {/* Data */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">
                    Data de vencimento
                    {dataVencimento && tipoSelecionado && DOCUMENTOS_CONFIG.find(c => c.tipo === tipoSelecionado)?.sugestao && (
                      <span className="ml-2 text-[10px] font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Sugerida</span>
                    )}
                  </Label>
                  <Input type="date" value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} className="h-11 border-slate-200" />
                </div>
                {/* Upload */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700">Foto ou arquivo</Label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-amber-300 transition-colors cursor-pointer bg-slate-50">
                    <input type="file" accept="image/*,application/pdf" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    {file ? (
                      <div className="flex items-center gap-3">
                        {file.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(file)} alt="preview" className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-slate-500" /></div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="flex gap-3"><Camera className="w-6 h-6 text-slate-400" /><Upload className="w-6 h-6 text-slate-400" /></div>
                        <p className="text-sm text-slate-500">Toque para fotografar ou escolher arquivo</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG ou PDF</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={addMutation.isPending || uploading || !tipoSelecionado}
                  className="w-full h-12 bg-[#C9A84C] hover:bg-[#b8943e] disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-amber-400/20 active:scale-95"
                >
                  {addMutation.isPending || uploading ? 'Salvando...' : 'Salvar Documento'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

// ─── Modal de histórico ───────────────────────────────────────────────────────
function HistoricoModal({ tipo, historico }: { tipo: string; historico: any[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-0.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">
        <History className="w-3 h-3" /> Histórico ({historico.length})
      </button>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900">Histórico: {tipo}</h3>
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-2">
                {historico.map((h: any, i: number) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {h.data_vencimento ? new Date(h.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Enviado em {new Date(h.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-[9px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full">ATUAL</span>}
                      {h.arquivo_url && (
                        <a href={h.arquivo_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-200 rounded-lg">
                          <ExternalLink className="w-3.5 h-3.5 text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Documentos;
