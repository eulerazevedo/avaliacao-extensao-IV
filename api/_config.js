// Fonte única de equipes e critérios. Usada pela API e servida ao front em /api/config.
// Para trocar a ordem, o texto ou um critério, edite só aqui.

const CRITERIOS = [
  { id: 'problema',  nome: 'Problema e relevância',   dica: 'O problema é real e importa para pessoas ou empresas?' },
  { id: 'solucao',   nome: 'Solução e produto',       dica: 'O produto resolve o problema e funcionou na demonstração?' },
  { id: 'inovacao',  nome: 'Inovação e diferencial',  dica: 'O que tem de novo ou melhor do que já existe?' },
  { id: 'valor',     nome: 'Valor para empresas',     dica: 'Há benefício claro, viabilidade e um pedido realista?' },
  { id: 'impacto',   nome: 'Impacto social',          dica: 'Atende bem uma comunidade ou público de verdade?' },
  { id: 'clareza',   nome: 'Clareza e apresentação',  dica: 'Comunicação, tempo respeitado e equipe alinhada.' },
];

// Ordem do sorteio de apresentação.
const EQUIPES = [
  { id: 'frequencia-premiada', ordem: 1, numero: 8, nome: 'EduPoints Frequência Premiada',
    frase: 'O aluno encosta a tag NFC no celular do professor, a chamada vira jogo e a gestão acompanha em tempo real.',
    area: 'Educação', pedido: 'Patrocinador de tags e uma escola piloto.',
    imagem: '/assets/projetos/edupoints.png' },
  { id: 'rotalog', ordem: 2, numero: 4, nome: 'RotaLog',
    frase: 'Marketplace B2B de abastecimento: o comprador pede, o fornecedor entrega e o motorista comprova, em um só fluxo.',
    area: 'Logística', pedido: 'Um fornecedor e um comprador para piloto.',
    imagem: null },
  { id: 'flurios', ordem: 3, numero: 3, nome: 'Flurios',
    frase: 'O cliente digita o código e vê onde está a encomenda no rio, de Manaus ao interior do Amazonas.',
    area: 'Transporte fluvial', pedido: 'Uma transportadora piloto na rota Manaus a Tefé.',
    imagem: '/assets/projetos/flurios.jpg' },
  { id: 'alerta-bairro', ordem: 4, numero: 7, nome: 'Alerta Bairro',
    frase: 'Mapa colaborativo em tempo real com radar de segurança e triagem por inteligência artificial.',
    area: 'Segurança comunitária', pedido: 'Associação de bairro, Defesa Civil ou prefeitura para piloto.',
    imagem: '/assets/projetos/alerta.png' },
  { id: 'campus-seguro', ordem: 5, numero: 2, nome: 'Campus Seguro',
    frase: 'App para denunciar ocorrências no campus com anonimato, evidências e botão de emergência.',
    area: 'Segurança e saúde', pedido: 'Segurança patrimonial e uma instituição para piloto.',
    imagem: null },
  { id: 'fila-justa', ordem: 6, numero: 6, nome: 'Fila Justa',
    frase: 'Agendamento online e fila de atendimento com prioridade justa para a Clínica Popular Vida Plena.',
    area: 'Saúde', pedido: 'Uma clínica ou UBS para piloto.',
    imagem: '/assets/projetos/filajusta.png' },
  { id: 'conecta-vagas', ordem: 7, numero: 5, nome: 'Conecta Vagas',
    frase: 'Plataforma que liga estudantes a vagas com compatibilidade calculada para cada perfil.',
    area: 'Empregabilidade', pedido: 'Vagas reais e um responsável de RH para o piloto.',
    imagem: '/assets/projetos/conecta.png' },
  { id: 'bsfarma', ordem: 8, numero: 1, nome: 'BSFarma',
    frase: 'Controle de estoque farmacêutico da UBS Saúde Sempre, com lotes, dispensação e alertas de validade.',
    area: 'Saúde pública', pedido: 'Uma UBS ou secretaria de saúde para piloto.',
    imagem: '/assets/projetos/bsfarma.png' },
];

const NOTA_MIN = 0;
const NOTA_MAX = 10;
const NOTA_PASSO = 0.5;

module.exports = { CRITERIOS, EQUIPES, NOTA_MIN, NOTA_MAX, NOTA_PASSO };
