export const getWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/55${cleanPhone}?text=${encodedMsg}`;
};

export const templates = {
  embarque: (alunoNome: string, motoristaNome: string) => 
    `Olá! O *${alunoNome}* acabou de embarcar na van do *Tio ${motoristaNome}*. Tenha um bom dia! 🚐💨`,
    
  desembarque: (alunoNome: string, motoristaNome: string) => 
    `Olá! O *${alunoNome}* acaba de chegar à escola/casa com o *Tio ${motoristaNome}*. Entregue com segurança! 🚐🏢`,
    
  falta: (alunoNome: string, motoristaNome: string) => 
    `Olá! Notei que o *${alunoNome}* não embarcou hoje. Tudo certo por aí? Att, *Tio ${motoristaNome}*.`,
};
