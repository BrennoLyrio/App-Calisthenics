'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if programs already exist to avoid duplicates
    const [existingPrograms] = await queryInterface.sequelize.query(`
      SELECT nome FROM programas_tematicos WHERE nome IN (
        'Desafio: 100 Flexões em um Dia',
        'Desafio: 7 Dias de Treino Consecutivos',
        '8 Semanas para o Handstand (Parada de Mãos)',
        '12 Semanas: Preparação para Muscle-Up'
      )
    `);

    const existingNames = existingPrograms.map((p) => p.nome);
    
    const newPrograms = [
      {
        nome: 'Desafio: 100 Flexões em um Dia',
        descricao: 'Desafio diário para fortalecer braços, peito e ombros. Complete 100 flexões ao longo do dia, divididas em séries.',
        duracao_dias: 1,
        nivel_requerido: 'intermediario',
        ativo: true,
        categoria: 'desafio',
        objetivo_principal: 'Completar 100 flexões em um único dia',
        exercicios_incluidos: [1, 2], // IDs dos exercícios de flexão
        requisitos: [
          'Nível intermediário em calistenia',
          'Capacidade de fazer pelo menos 10 flexões consecutivas',
          'Determinação e disciplina'
        ],
        beneficios: [
          'Fortalecimento do peito, tríceps e ombros',
          'Melhora da resistência muscular',
          'Aumento da força funcional',
          'Desafio mental de persistência'
        ],
        dificuldade_inicial: 5,
        dificuldade_final: 7,
        calorias_estimadas_total: 250,
        tempo_estimado_diario: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Desafio: 7 Dias de Treino Consecutivos',
        descricao: 'Desafio semanal para estabelecer uma rotina consistente. Treine 7 dias seguidos com exercícios variados.',
        duracao_dias: 7,
        nivel_requerido: 'iniciante',
        ativo: true,
        categoria: 'desafio',
        objetivo_principal: 'Manter consistência de treino por uma semana completa',
        exercicios_incluidos: [1, 3, 5, 7], // IDs variados de exercícios
        requisitos: [
          'Nível iniciante ou superior',
          'Compromisso com 7 dias consecutivos',
          'Disponibilidade de 20-30 minutos diários'
        ],
        beneficios: [
          'Estabelecer hábito de treino regular',
          'Melhora da consistência',
          'Aumento da motivação',
          'Desenvolvimento de disciplina'
        ],
        dificuldade_inicial: 3,
        dificuldade_final: 6,
        calorias_estimadas_total: 700,
        tempo_estimado_diario: 25,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '8 Semanas para o Handstand (Parada de Mãos)',
        descricao: 'Programa completo e progressivo para aprender a fazer a parada de mãos. Desde os fundamentos até a execução completa.',
        duracao_dias: 56,
        nivel_requerido: 'intermediario',
        ativo: true,
        categoria: 'programa',
        objetivo_principal: 'Dominar a parada de mãos com técnica correta',
        exercicios_incluidos: [1, 2, 3, 5], // IDs dos exercícios preparatórios
        requisitos: [
          'Nível intermediário em calistenia',
          'Boa flexibilidade de ombros e punhos',
          'Disponibilidade de 30-45 minutos por dia',
          'Paciência e consistência'
        ],
        beneficios: [
          'Melhora do equilíbrio e coordenação',
          'Fortalecimento de ombros, core e punhos',
          'Desenvolvimento de controle corporal',
          'Aumento da confiança e autoestima'
        ],
        dificuldade_inicial: 5,
        dificuldade_final: 9,
        calorias_estimadas_total: 2400,
        tempo_estimado_diario: 35,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '12 Semanas: Preparação para Muscle-Up',
        descricao: 'Programa intensivo para conquistar o movimento avançado de muscle-up na barra. Preparação física e técnica completa.',
        duracao_dias: 84,
        nivel_requerido: 'intermediario',
        ativo: true,
        categoria: 'programa',
        objetivo_principal: 'Executar o primeiro muscle-up com técnica perfeita',
        exercicios_incluidos: [1, 2, 4, 6], // IDs dos exercícios preparatórios
        requisitos: [
          'Nível intermediário avançado',
          'Capacidade de fazer pelo menos 10 barras fixas',
          'Acesso a uma barra fixa',
          'Disponibilidade de 40-50 minutos por dia'
        ],
        beneficios: [
          'Fortalecimento extremo de braços e costas',
          'Desenvolvimento de explosividade',
          'Melhora da coordenação neuromuscular',
          'Conquista de um movimento avançado'
        ],
        dificuldade_inicial: 6,
        dificuldade_final: 10,
        calorias_estimadas_total: 3500,
        tempo_estimado_diario: 45,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(program => !existingNames.includes(program.nome));

    if (newPrograms.length > 0) {
      await queryInterface.bulkInsert('programas_tematicos', newPrograms);
      console.log(`✅ ${newPrograms.length} novos programas adicionados!`);
    } else {
      console.log('ℹ️ Todos os programas já existem no banco de dados.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM programas_tematicos 
      WHERE nome IN (
        'Desafio: 100 Flexões em um Dia',
        'Desafio: 7 Dias de Treino Consecutivos',
        '8 Semanas para o Handstand (Parada de Mãos)',
        '12 Semanas: Preparação para Muscle-Up'
      )
    `);
  }
};

