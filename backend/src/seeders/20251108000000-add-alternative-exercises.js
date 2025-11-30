'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se os exercícios já existem para evitar duplicatas
    const [existingExercises] = await queryInterface.sequelize.query(`
      SELECT nome FROM exercicios WHERE nome IN (
        'Flexão Diamante',
        'Flexão Inclinada',
        'Flexão com Apoio no Joelho',
        'Agachamento Sumo',
        'Agachamento Búlgaro',
        'Afundo',
        'Prancha com Elevação de Perna',
        'Mountain Climber',
        'Dead Bug',
        'Burpee Simplificado',
        'Agachamento com Salto',
        'Prancha com Rotação'
      )
    `);

    const existingNames = existingExercises.map((e) => e.nome);

    // Exercícios alternativos para SUPERIORES (peito, ombros, tríceps)
    const upperBodyAlternatives = [
      {
        nome: 'Flexão Diamante',
        categoria: 'superiores',
        descricao_textual: 'Variante de flexão que foca mais nos tríceps. Posicione as mãos próximas formando um diamante.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['peito', 'tríceps', 'ombros'],
        instrucoes: [
          'Posicione as mãos próximas formando um diamante',
          'Mantenha o corpo em linha reta',
          'Desça até quase tocar o chão com o peito',
          'Empurre para voltar à posição inicial'
        ],
        dicas: [
          'Foque em trabalhar os tríceps',
          'Mantenha o core contraído',
          'Controle o movimento'
        ],
        variacoes: ['flexão diamante elevada', 'flexão diamante declinada'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=J0DnG1_S92I',
        tipo: 'reps',
        repeticoes_estimadas: 8,
        tempo_estimado: 0,
        calorias_estimadas: 9,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Flexão Inclinada',
        categoria: 'superiores',
        descricao_textual: 'Versão mais fácil da flexão, ideal para iniciantes. Apoie as mãos em uma superfície elevada.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['peito', 'ombros', 'tríceps'],
        instrucoes: [
          'Encontre uma superfície elevada (mesa, parede)',
          'Posicione as mãos na largura dos ombros',
          'Mantenha o corpo em linha reta',
          'Desça o corpo em direção à superfície',
          'Empurre para voltar'
        ],
        dicas: [
          'Ideal para quem está começando',
          'Quanto mais elevada a superfície, mais fácil',
          'Mantenha o core contraído'
        ],
        variacoes: ['flexão inclinada na parede', 'flexão inclinada no banco'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=cfnsWBy2kNE',
        tipo: 'reps',
        repeticoes_estimadas: 12,
        tempo_estimado: 0,
        calorias_estimadas: 7,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Flexão com Apoio no Joelho',
        categoria: 'superiores',
        descricao_textual: 'Versão modificada da flexão para iniciantes. Mantenha os joelhos apoiados no chão.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['peito', 'ombros', 'tríceps'],
        instrucoes: [
          'Comece na posição de flexão tradicional',
          'Apoie os joelhos no chão',
          'Mantenha o tronco reto',
          'Execute o movimento de flexão normalmente'
        ],
        dicas: [
          'Perfeito para quem não consegue fazer flexão completa',
          'Mantenha o corpo alinhado dos joelhos aos ombros',
          'Progressão natural para flexão completa'
        ],
        variacoes: ['flexão com joelho mais afastado'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 6,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(e => !existingNames.includes(e.nome));

    // Exercícios alternativos para INFERIORES (quadríceps, glúteos, isquiotibiais)
    const lowerBodyAlternatives = [
      {
        nome: 'Agachamento Sumo',
        categoria: 'inferiores',
        descricao_textual: 'Variante do agachamento com pés mais afastados. Foca mais na parte interna das coxas e glúteos.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'adutores', 'isquiotibiais'],
        instrucoes: [
          'Fique em pé com pés mais largos que os ombros',
          'Aponte os pés para fora (45 graus)',
          'Mantenha o peito erguido',
          'Desça mantendo os joelhos alinhados com os pés',
          'Suba até a posição inicial'
        ],
        dicas: [
          'Foca mais na parte interna das coxas',
          'Mantenha o peso nos calcanhares',
          'Desça o máximo que conseguir confortavelmente'
        ],
        variacoes: ['agachamento sumo com salto', 'agachamento sumo com peso'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
        tipo: 'reps',
        repeticoes_estimadas: 12,
        tempo_estimado: 0,
        calorias_estimadas: 13,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Agachamento Búlgaro',
        categoria: 'inferiores',
        descricao_textual: 'Agachamento unilateral com perna traseira elevada. Excelente para força e equilíbrio.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'isquiotibiais'],
        instrucoes: [
          'Posicione o pé traseiro em uma superfície elevada',
          'Mantenha o pé dianteiro fixo',
          'Desça o corpo mantendo o tronco ereto',
          'O joelho dianteiro deve formar 90 graus',
          'Suba até a posição inicial'
        ],
        dicas: [
          'Foque no equilíbrio',
          'Não deixe o joelho ultrapassar o tornozelo',
          'Faça o mesmo número de repetições para cada perna'
        ],
        variacoes: ['com peso', 'sem elevação'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 14,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Afundo',
        categoria: 'inferiores',
        descricao_textual: 'Exercício unilateral excelente para pernas e glúteos. Dê um passo largo para frente e desça.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'isquiotibiais', 'panturrilhas'],
        instrucoes: [
          'Fique em pé com os pés na largura dos quadris',
          'Dê um passo largo para frente',
          'Desça até o joelho traseiro quase tocar o chão',
          'Ambos os joelhos devem formar 90 graus',
          'Empurre com o calcanhar para voltar'
        ],
        dicas: [
          'Mantenha o tronco ereto',
          'O joelho dianteiro não deve ultrapassar o tornozelo',
          'Faça o mesmo número de repetições para cada perna'
        ],
        variacoes: ['afundo reverso', 'afundo com salto', 'afundo caminhando'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 12,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Agachamento com Salto',
        categoria: 'inferiores',
        descricao_textual: 'Agachamento explosivo com salto. Adiciona componente de potência e condicionamento cardiovascular.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'panturrilhas'],
        instrucoes: [
          'Fique em pé com os pés na largura dos ombros',
          'Desça em agachamento',
          'Exploda para cima em um salto',
          'Aterriss suavemente',
          'Repita imediatamente'
        ],
        dicas: [
          'Foque na explosividade',
          'Aterre suavemente para proteger as articulações',
          'Mantenha o core contraído durante o salto'
        ],
        variacoes: ['salto com rotação', 'salto em profundidade'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=U4s4mEQ5VqU',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 15,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(e => !existingNames.includes(e.nome));

    // Exercícios alternativos para CORE (abdômen, oblíquos, lombar)
    const coreAlternatives = [
      {
        nome: 'Prancha com Elevação de Perna',
        categoria: 'core',
        descricao_textual: 'Variante da prancha que adiciona trabalho de glúteos e estabilização. Eleve uma perna enquanto mantém a prancha.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['abdômen', 'oblíquos', 'glúteos', 'lombar'],
        instrucoes: [
          'Comece na posição de prancha',
          'Mantenha o corpo alinhado',
          'Eleve uma perna para trás',
          'Mantenha a posição',
          'Troque de perna'
        ],
        dicas: [
          'Mantenha o quadril estável',
          'Não deixe o corpo girar',
          'Controle o movimento'
        ],
        variacoes: ['prancha com elevação alternada', 'prancha com elevação de braço e perna'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=8GqXkOM6bB8',
        tipo: 'timer',
        tempo_estimado: 60,
        repeticoes_estimadas: 0,
        calorias_estimadas: 7,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Mountain Climber',
        categoria: 'core',
        descricao_textual: 'Exercício dinâmico que trabalha core, ombros e condicionamento cardiovascular. Alterna pernas como se estivesse correndo no lugar.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['abdômen', 'ombros', 'quadríceps', 'isquiotibiais'],
        instrucoes: [
          'Comece na posição de flexão',
          'Mantenha o corpo alinhado',
          'Traga um joelho em direção ao peito',
          'Volte e traga o outro joelho',
          'Mantenha o ritmo constante'
        ],
        dicas: [
          'Mantenha o core contraído',
          'Mantenha o ritmo constante',
          'Não deixe o quadril subir'
        ],
        variacoes: ['mountain climber lento', 'mountain climber com cruzamento'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
        tipo: 'timer',
        tempo_estimado: 30,
        repeticoes_estimadas: 0,
        calorias_estimadas: 10,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Dead Bug',
        categoria: 'core',
        descricao_textual: 'Exercício de estabilização do core. Deite de costas e mova braço e perna opostos simultaneamente.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['abdômen', 'oblíquos', 'lombar'],
        instrucoes: [
          'Deite de costas com braços estendidos',
          'Levante as pernas em 90 graus',
          'Expire e estenda braço direito e perna esquerda',
          'Volte à posição inicial',
          'Repita com o lado oposto'
        ],
        dicas: [
          'Mantenha a lombar no chão',
          'Controle o movimento',
          'Respire de forma controlada'
        ],
        variacoes: ['dead bug com peso', 'dead bug unilateral'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws',
        tipo: 'reps',
        repeticoes_estimadas: 12,
        tempo_estimado: 0,
        calorias_estimadas: 5,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Prancha com Rotação',
        categoria: 'core',
        descricao_textual: 'Variante da prancha lateral com rotação. Trabalha os oblíquos e melhora a estabilidade rotacional.',
        nivel_dificuldade: 'intermediario',
        musculos_trabalhados: ['oblíquos', 'abdômen', 'ombros'],
        instrucoes: [
          'Comece na prancha lateral',
          'Mantenha o corpo alinhado',
          'Rotacione o tronco trazendo o braço livre por baixo',
          'Volte à posição inicial',
          'Troque de lado'
        ],
        dicas: [
          'Mantenha o quadril estável',
          'Controle o movimento de rotação',
          'Respire normalmente'
        ],
        variacoes: ['rotação com peso', 'rotação dinâmica'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=qYF5PE_7V94',
        tipo: 'reps',
        repeticoes_estimadas: 10,
        tempo_estimado: 0,
        calorias_estimadas: 8,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(e => !existingNames.includes(e.nome));

    // Exercícios alternativos para COMPLETO (burpee)
    const fullBodyAlternatives = [
      {
        nome: 'Burpee Simplificado',
        categoria: 'completo',
        descricao_textual: 'Versão mais fácil do burpee, sem o salto final. Ideal para iniciantes que querem trabalhar todo o corpo.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['peito', 'ombros', 'pernas', 'core'],
        instrucoes: [
          'Fique em pé',
          'Agache e coloque as mãos no chão',
          'Salte os pés para trás',
          'Faça uma flexão (ou pule esta etapa)',
          'Volte os pés para a posição de agachamento',
          'Levante-se (sem salto)'
        ],
        dicas: [
          'Ideal para iniciantes',
          'Foque na técnica',
          'Aumente a velocidade gradualmente'
        ],
        variacoes: ['burpee sem flexão', 'burpee com salto pequeno'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=auBLPXO8Fww',
        tipo: 'reps',
        repeticoes_estimadas: 8,
        tempo_estimado: 0,
        calorias_estimadas: 12,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ].filter(e => !existingNames.includes(e.nome));

    // Combinar todos os exercícios alternativos
    const allAlternatives = [
      ...upperBodyAlternatives,
      ...lowerBodyAlternatives,
      ...coreAlternatives,
      ...fullBodyAlternatives
    ];

    if (allAlternatives.length > 0) {
      await queryInterface.bulkInsert('exercicios', allAlternatives);
      console.log(`✅ Adicionados ${allAlternatives.length} exercícios alternativos`);
    } else {
      console.log('ℹ️ Todos os exercícios alternativos já existem no banco de dados');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover os exercícios alternativos adicionados
    await queryInterface.sequelize.query(`
      DELETE FROM exercicios WHERE nome IN (
        'Flexão Diamante',
        'Flexão Inclinada',
        'Flexão com Apoio no Joelho',
        'Agachamento Sumo',
        'Agachamento Búlgaro',
        'Afundo',
        'Prancha com Elevação de Perna',
        'Mountain Climber',
        'Dead Bug',
        'Burpee Simplificado',
        'Agachamento com Salto',
        'Prancha com Rotação'
      )
    `);
  }
};

