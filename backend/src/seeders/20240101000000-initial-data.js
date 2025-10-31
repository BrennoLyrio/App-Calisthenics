'use strict';

const { Exercise, ThematicProgram } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed exercises
    const exercises = [
      {
        nome: 'Flexão de Braço',
        categoria: 'superiores',
        descricao_textual: 'Exercício clássico para fortalecer peito, ombros e tríceps. Deite-se de bruços, apoie as mãos no chão na largura dos ombros e empurre o corpo para cima.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['peito', 'ombros', 'tríceps'],
        instrucoes: [
          'Deite-se de bruços no chão',
          'Posicione as mãos na largura dos ombros',
          'Mantenha o corpo em linha reta',
          'Empurre o corpo para cima',
          'Desça controladamente'
        ],
        dicas: [
          'Mantenha o core contraído',
          'Não deixe o quadril subir ou descer',
          'Respire na subida e expire na descida'
        ],
        variacoes: ['flexão inclinada', 'flexão declinada', 'flexão diamante'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=GOj4TMPVuZg',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 8,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Agachamento',
        categoria: 'inferiores',
        descricao_textual: 'Exercício fundamental para pernas e glúteos. Fique em pé com os pés na largura dos ombros e desça como se fosse sentar em uma cadeira.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'isquiotibiais'],
        instrucoes: [
          'Fique em pé com os pés na largura dos ombros',
          'Mantenha o peito erguido',
          'Desça como se fosse sentar',
          'Mantenha os joelhos alinhados com os pés',
          'Suba até a posição inicial'
        ],
        dicas: [
          'Mantenha o peso nos calcanhares',
          'Não deixe os joelhos ultrapassarem os pés',
          'Mantenha o core contraído'
        ],
        variacoes: ['agachamento sumo', 'agachamento búlgaro', 'agachamento com salto'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=XI-4buHz7Xo',
        tipo: 'timer',
        tempo_estimado: 45,
        repeticoes_estimadas: 0,
        calorias_estimadas: 12,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Prancha',
        categoria: 'core',
        descricao_textual: 'Exercício isométrico para fortalecer o core. Fique na posição de flexão, mas apoie-se nos antebraços e mantenha o corpo em linha reta.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['abdômen', 'oblíquos', 'lombar'],
        instrucoes: [
          'Deite-se de bruços',
          'Apoie-se nos antebraços',
          'Mantenha o corpo em linha reta',
          'Contraia o abdômen',
          'Mantenha a posição'
        ],
        dicas: [
          'Não deixe o quadril subir ou descer',
          'Mantenha a respiração normal',
          'Olhe para o chão'
        ],
        variacoes: ['prancha lateral', 'prancha com elevação de perna', 'prancha com toque no ombro'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=thZZtS9gapk',
        tipo: 'timer',
        tempo_estimado: 60,
        repeticoes_estimadas: 0,
        calorias_estimadas: 5,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Burpee',
        categoria: 'completo',
        descricao_textual: 'Exercício completo que combina agachamento, flexão e salto. Excelente para condicionamento cardiovascular e força.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['peito', 'ombros', 'pernas', 'core'],
        instrucoes: [
          'Fique em pé',
          'Agache e coloque as mãos no chão',
          'Salte os pés para trás',
          'Faça uma flexão',
          'Volte à posição de agachamento',
          'Salte para cima'
        ],
        dicas: [
          'Mantenha o ritmo constante',
          'Respire de forma controlada',
          'Mantenha o core contraído'
        ],
        variacoes: ['burpee sem flexão', 'burpee com salto', 'burpee com elevação de joelho'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=MKuYq5FR_CM',
        tipo: 'timer',
        tempo_estimado: 45,
        repeticoes_estimadas: 0,
        calorias_estimadas: 15,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Prancha Lateral',
        categoria: 'core',
        descricao_textual: 'Exercício para fortalecer os oblíquos e estabilizar o core. Deite-se de lado e apoie-se no antebraço.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['oblíquos', 'abdômen', 'ombros'],
        instrucoes: [
          'Deite-se de lado',
          'Apoie-se no antebraço',
          'Mantenha o corpo em linha reta',
          'Contraia o core',
          'Mantenha a posição'
        ],
        dicas: [
          'Mantenha o quadril alinhado',
          'Não deixe o corpo girar',
          'Respire normalmente'
        ],
        variacoes: ['prancha lateral com elevação de perna', 'prancha lateral com rotação'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=RPr51FgCYbA',
        tipo: 'timer',
        tempo_estimado: 45,
        repeticoes_estimadas: 0,
        calorias_estimadas: 6,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('exercicios', exercises);

    // Seed thematic programs
    const programs = [
      {
        nome: '30 Dias de Fortalecimento do Core',
        descricao: 'Programa de 30 dias focado no fortalecimento da região central do corpo, incluindo abdômen, oblíquos e lombar.',
        duracao_dias: 30,
        nivel_requerido: 'iniciante',
        ativo: true,
        categoria: 'desafio',
        objetivo_principal: 'Fortalecer e definir a região do core',
        exercicios_incluidos: [1, 3, 5], // IDs dos exercícios
        requisitos: [
          'Nível iniciante em calistenia',
          'Disponibilidade de 15-20 minutos por dia',
          'Espaço para exercícios no chão'
        ],
        beneficios: [
          'Melhora da postura',
          'Redução de dores nas costas',
          'Aumento da estabilidade',
          'Melhora do equilíbrio'
        ],
        dificuldade_inicial: 3,
        dificuldade_final: 6,
        calorias_estimadas_total: 450,
        tempo_estimado_diario: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: '6 Semanas para a Primeira Barra Fixa',
        descricao: 'Programa progressivo para conquistar a primeira barra fixa, começando com exercícios preparatórios.',
        duracao_dias: 42,
        nivel_requerido: 'iniciante',
        ativo: true,
        categoria: 'programa',
        objetivo_principal: 'Conquistar a primeira barra fixa',
        exercicios_incluidos: [1, 2, 3], // IDs dos exercícios
        requisitos: [
          'Nível iniciante em calistenia',
          'Acesso a uma barra fixa ou local para instalar',
          'Disponibilidade de 25-30 minutos por dia'
        ],
        beneficios: [
          'Fortalecimento dos membros superiores',
          'Melhora da força de preensão',
          'Aumento da confiança',
          'Desenvolvimento da coordenação'
        ],
        dificuldade_inicial: 2,
        dificuldade_final: 8,
        calorias_estimadas_total: 1200,
        tempo_estimado_diario: 25,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('programas_tematicos', programs);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('programas_tematicos', null, {});
    await queryInterface.bulkDelete('exercicios', null, {});
  }
};
