import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const exportFrequenciaMensalPDF = (
  mesReferencia: string, // YYYY-MM
  alunos: any[],
  frequencias: any[],
  profile: any
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const [year, month] = mesReferencia.split('-').map(Number);
  const dataRef = new Date(year, month - 1, 1);
  const nomeMes = format(dataRef, 'MMMM yyyy', { locale: ptBR });
  const diasNoMes = new Date(year, month, 0).getDate();

  // --- Header ---
  doc.setFillColor(247, 209, 23); // Vanzeiro Yellow (#F7D117)
  doc.rect(0, 0, 297, 30, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VANZEIRO', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('GESTÃO PROFISSIONAL DE TRANSPORTE ESCOLAR', 14, 24);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RELATÓRIO DE FREQUÊNCIA MENSAL', 283, 18, { align: 'right' });
  doc.setFontSize(11);
  doc.text(nomeMes.toUpperCase(), 283, 24, { align: 'right' });

  // --- Driver & Vehicle Info ---
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Motorista: ${profile?.nome || 'Não informado'}`, 14, 40);
  doc.text(`Veículo: ${profile?.veiculo_modelo || '-'} | Placa: ${profile?.veiculo_placa || '-'}`, 14, 45);
  doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 283, 40, { align: 'right' });

  // --- Table Data Preparation ---
  const days = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const tableHeaders = ['Aluno', ...days.map(String)];

  const tableRows = alunos.map((aluno) => {
    const row = [aluno.nome];
    days.forEach((dayNum) => {
      const dateStr = `${mesReferencia}-${String(dayNum).padStart(2, '0')}`;
      const freq = frequencias.find(
        (f) => f.aluno_id === aluno.id && f.data === dateStr
      );
      
      if (!freq) {
        row.push('-');
      } else {
        row.push(freq.status === 'presente' ? 'P' : 'F');
      }
    });
    return row;
  });

  // --- Render Table ---
  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 55,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      halign: 'center',
    },
    headStyles: {
      fillColor: [40, 40, 40],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 },
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index > 0) {
        if (data.cell.text[0] === 'P') {
          data.cell.styles.textColor = [0, 150, 0]; // Green for Presence
        } else if (data.cell.text[0] === 'F') {
          data.cell.styles.textColor = [200, 0, 0]; // Red for Absence
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  // --- Footer & Signature ---
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Legenda: P = Presente | F = Falta | - = Sem registro', 14, finalY);

  doc.setDrawColor(180, 180, 180);
  doc.line(160, finalY + 15, 260, finalY + 15);
  doc.text('Assinatura do Responsável / Motorista', 210, finalY + 20, { align: 'center' });

  // --- Save ---
  doc.save(`Frequencia_${mesReferencia}_${profile?.nome?.replace(/\s+/g, '_') || 'Motorista'}.pdf`);
};
