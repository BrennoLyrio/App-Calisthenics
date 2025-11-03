'use strict';

const { Exercise } = require('../models');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Warmup exercises
    const warmupExercises = [
      {
        nome: 'Polichinelo',
        categoria: 'aquecimento',
        descricao_textual: 'Exercício cardio clássico para elevar a temperatura corporal e preparar o sistema cardiovascular. Ideal para iniciar qualquer treino.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['ombros', 'panturrilhas', 'glúteos'],
        instrucoes: [
          'Fique em pé com os pés juntos e braços ao lado do corpo',
          'Salte abrindo as pernas na largura dos ombros',
          'Simultaneamente, levante os braços acima da cabeça',
          'Volte à posição inicial em um salto',
          'Mantenha o ritmo constante'
        ],
        dicas: [
          'Mantenha os joelhos levemente flexionados',
          'Terra suavemente na ponta dos pés',
          'Controle a velocidade se necessário'
        ],
        variacoes: ['polichinelo lento', 'polichinelo com salto alto'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=nGaXj3kkmrU',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 3,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Corrida no Lugar',
        categoria: 'aquecimento',
        descricao_textual: 'Aquecimento cardiovascular simples e eficaz. Eleva a frequência cardíaca e prepara músculos e articulações para o exercício.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'isquiotibiais', 'panturrilhas'],
        instrucoes: [
          'Fique em pé com os pés na largura dos ombros',
          'Comece a correr no lugar levantando os joelhos',
          'Bombeie os braços como em uma corrida normal',
          'Mantenha a postura ereta',
          'Aumente gradualmente a velocidade'
        ],
        dicas: [
          'Aterre na ponta dos pés',
          'Mantenha os braços em movimento',
          'Respire de forma ritmada'
        ],
        variacoes: ['corrida no lugar lenta', 'corrida com joelhos altos'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=jHyyv9Xl2B0',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 60,
        calorias_estimadas: 4,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Rotação de Braços',
        categoria: 'aquecimento',
        descricao_textual: 'Ativa as articulações dos ombros e prepara os braços para exercícios de empurrar e puxar.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['ombros', 'peito', 'costas'],
        instrucoes: [
          'Fique em pé com os braços estendidos para os lados',
          'Faça círculos pequenos para frente',
          'Aumente gradualmente o tamanho dos círculos',
          'Após 10 rotações, inverta a direção',
          'Faça 10 círculos grandes para trás'
        ],
        dicas: [
          'Mantenha os braços relaxados',
          'Aumente a amplitude gradualmente',
          'Respire normalmente'
        ],
        variacoes: ['rotação única de cada braço', 'rotação alternada'],
        equipamentos_necessarios: ['nenhum'],
        tipo: 'reps',
        repeticoes_estimadas: 20,
        tempo_estimado: 0,
        calorias_estimadas: 2,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Agachamento Dinâmico',
        categoria: 'aquecimento',
        descricao_textual: 'Aquece as pernas e ativa os glúteos de forma dinâmica, preparando para exercícios de membros inferiores.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'panturrilhas'],
        instrucoes: [
          'Fique em pé com os pés na largura dos ombros',
          'Faça um agachamento leve descendo até 90 graus',
          'Subir dando um salto suave',
          'Aterre suavemente e repita',
          'Mantenha o ritmo constante'
        ],
        dicas: [
          'Não desça muito rápido',
          'Mantenha os joelhos alinhados',
          'Landing suave para evitar impacto'
        ],
        variacoes: ['agachamento sem salto', 'agachamento sumo'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=dQ__fM5V-Lc',
        tipo: 'reps',
        repeticoes_estimadas: 12,
        tempo_estimado: 0,
        calorias_estimadas: 3,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Stretching/Cooldown exercises
    const cooldownExercises = [
      {
        nome: 'Alongamento de Panturrilha',
        categoria: 'alongamento',
        descricao_textual: 'Alivia tensão nas panturrilhas após o treino. Melhora flexibilidade e reduz dores musculares.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['panturrilhas', 'tendão de Aquiles'],
        instrucoes: [
          'Fique em pé com os pés juntos',
          'Dê um passo à frente com a perna esquerda',
          'Mantenha a perna direita estendida atrás',
          'Pressione o calcanhar direito no chão',
          'Mantenha por 30 segundos e troque'
        ],
        dicas: [
          'Não dobre o joelho da perna traseira',
          'Respire profundamente',
          'Sinta o alongamento suave'
        ],
        variacoes: ['alongamento contra a parede', 'alongamento sentado'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=_XubEtl0_30',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Alongamento de Quadríceps',
        categoria: 'alongamento',
        descricao_textual: 'Estica os músculos da frente da coxa, essencial após exercícios de pernas. Previne rigidez e dores.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'flexores do quadril'],
        instrucoes: [
          'Fique em pé apoiando-se em algo',
          'Dobre o joelho direito e segure o pé',
          'Puxe o pé em direção ao glúteo',
          'Mantenha os joelhos juntos',
          'Segure por 30 segundos e troque'
        ],
        dicas: [
          'Mantenha as costas retas',
          'Não force o alongamento',
          'Respire profundamente'
        ],
        variacoes: ['alongamento deitado', 'alongamento com faixa'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=HqRMAwQVYJ8',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Alongamento de Ombro',
        categoria: 'alongamento',
        descricao_textual: 'Relaxa os ombros e peito após exercícios de empurrar. Melhora postura e reduz tensão.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['ombros', 'peito', 'costas superiores'],
        instrucoes: [
          'Fique em pé ou sentado',
          'Leve o braço direito através do peito',
          'Use o braço esquerdo para pressionar',
          'Mantenha por 30 segundos',
          'Repita com o outro braço'
        ],
        dicas: [
          'Não force o alongamento',
          'Respire profundamente',
          'Relaxe os ombros'
        ],
        variacoes: ['alongamento de porta', 'alongamento de parede'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=5FBwUUhQb9E',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Alongamento de Posterior de Coxa',
        categoria: 'alongamento',
        descricao_textual: 'Estica os músculos da parte de trás da coxa. Essencial para flexibilidade e prevenção de lesões.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['isquiotibiais', 'glúteos'],
        instrucoes: [
          'Sente-se no chão com as pernas estendidas',
          'Incline o tronco para frente',
          'Tente alcançar os dedos dos pés',
          'Mantenha as costas retas',
          'Segure por 30 segundos'
        ],
        dicas: [
          'Não force a curvatura das costas',
          'Vá devagar e respeite o limite',
          'Respire profundamente'
        ],
        variacoes: ['alongamento em pé', 'alongamento deitado'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Alongamento de Tríceps',
        categoria: 'alongamento',
        descricao_textual: 'Relaxa os músculos da parte de trás do braço após flexões e outros exercícios de empurrar.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['tríceps', 'ombros'],
        instrucoes: [
          'Fique em pé ou sentado',
          'Leve o braço direito acima da cabeça',
          'Dobre o cotovelo apontando para baixo',
          'Use a mão esquerda para puxar o cotovelo',
          'Segure por 30 segundos e troque'
        ],
        dicas: [
          'Mantenha a postura reta',
          'Não force demais',
          'Respire normalmente'
        ],
        variacoes: ['alongamento sentado', 'alongamento com toalha'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=d_Jt-zgX7SU',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Alongamento de Flexores do Quadril',
        categoria: 'alongamento',
        descricao_textual: 'Alivia tensão na frente do quadril. Important para quem senta muito ou faz agachamentos.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['flexores do quadril', 'quadríceps'],
        instrucoes: [
          'Ajoelhe-se com o joelho direito no chão',
          'Pé esquerdo à frente formando 90 graus',
          'Empurre o quadril para frente',
          'Mantenha a postura ereta',
          'Segure por 30 segundos e troque'
        ],
        dicas: [
          'Não deixe o joelho passar do tornozelo',
          'Respire profundamente',
          'Sinta o alongamento na frente do quadril'
        ],
        variacoes: ['com elevação', 'sentado'],
        equipamentos_necessarios: ['nenhum'],
        video_url: 'https://www.youtube.com/watch?v=7bRa_vKz8G4',
        tipo: 'timer',
        repeticoes_estimadas: 0,
        tempo_estimado: 30,
        calorias_estimadas: 1,
        ativo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert warmup exercises
    await queryInterface.bulkInsert('exercicios', warmupExercises);

    // Insert cooldown exercises
    await queryInterface.bulkInsert('exercicios', cooldownExercises);
  },

  async down(queryInterface, Sequelize) {
    // Remove warmup and cooldown exercises
    await queryInterface.bulkDelete('exercicios', {
      categoria: ['aquecimento', 'alongamento']
    });
  }
};
