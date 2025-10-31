// Script temporário para executar seeders sem depender do sequelize-cli
require('dotenv').config();
const { Exercise, ThematicProgram } = require('./dist/models');

async function seedData() {
  try {
    console.log('🌱 Executando seeders...');

    const exercises = [
      {
        nome: 'Flexão de Braço',
        categoria: 'superiores',
        descricao_textual: 'Exercício clássico para fortalecer peito, ombros e tríceps.',
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
        equipamentos_necessarios: [],
        tempo_estimado: 30,
        calorias_estimadas: 8,
        ativo: true
      },
      {
        nome: 'Agachamento',
        categoria: 'inferiores',
        descricao_textual: 'Exercício fundamental para fortalecer pernas e glúteos.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['quadríceps', 'glúteos', 'isquiotibiais'],
        instrucoes: [
          'Fique em pé com os pés na largura dos ombros',
          'Mantenha o peito erguido e o core contraído',
          'Desça como se fosse sentar em uma cadeira',
          'Mantenha os joelhos alinhados com os pés',
          'Volte à posição inicial'
        ],
        dicas: [
          'Mantenha o peso nos calcanhares',
          'Não deixe os joelhos ultrapassarem os pés',
          'Mantenha o peito erguido durante todo o movimento'
        ],
        variacoes: ['agachamento sumo', 'agachamento com salto', 'agachamento búlgaro'],
        equipamentos_necessarios: [],
        tempo_estimado: 45,
        calorias_estimadas: 12,
        ativo: true
      },
      {
        nome: 'Prancha',
        categoria: 'core',
        descricao_textual: 'Exercício isométrico para fortalecer o core.',
        nivel_dificuldade: 'iniciante',
        musculos_trabalhados: ['abdômen', 'oblíquos', 'lombar'],
        instrucoes: [
          'Deite-se de bruços no chão',
          'Apoie-se nos antebraços e pontas dos pés',
          'Mantenha o corpo em linha reta',
          'Contraia o abdômen',
          'Mantenha a posição pelo tempo determinado'
        ],
        dicas: [
          'Mantenha o corpo sempre em linha reta',
          'Não deixe o quadril subir ou descer',
          'Respire normalmente durante o exercício'
        ],
        variacoes: ['prancha lateral', 'prancha com elevação de perna', 'prancha dinâmica'],
        equipamentos_necessarios: [],
        tempo_estimado: 60,
        calorias_estimadas: 6,
        ativo: true
      }
    ];

    console.log('📝 Criando exercícios...');
    for (const exerciseData of exercises) {
      const [exercise, created] = await Exercise.findOrCreate({
        where: { nome: exerciseData.nome },
        defaults: exerciseData
      });
      if (created) {
        console.log(`✅ Exercício criado: ${exercise.nome}`);
      } else {
        console.log(`⚠️ Exercício já existe: ${exercise.nome}`);
      }
    }

    const programs = [
      {
        nome: 'Iniciante Completo',
        descricao: 'Programa para quem está começando na calistenia',
        duracao_dias: 56,
        nivel_requerido: 'iniciante',
        categoria: 'programa',
        objetivo_principal: 'Desenvolver força e resistência básica',
        exercicios_incluidos: [1, 2, 3],
        requisitos: ['Nenhum requisito prévio'],
        beneficios: ['Fortalecimento muscular', 'Melhora da resistência', 'Base sólida para exercícios avançados'],
        dificuldade_inicial: 1,
        dificuldade_final: 3,
        calorias_estimadas_total: 1200,
        tempo_estimado_diario: 30,
        ativo: true
      },
      {
        nome: 'Força e Resistência',
        descricao: 'Programa focado em desenvolver força e resistência muscular',
        duracao_dias: 84,
        nivel_requerido: 'intermediario',
        categoria: 'programa',
        objetivo_principal: 'Aumentar força e resistência muscular',
        exercicios_incluidos: [1, 2, 3],
        requisitos: ['Experiência básica com calistenia'],
        beneficios: ['Aumento significativo da força', 'Melhora da resistência', 'Preparação para exercícios avançados'],
        dificuldade_inicial: 3,
        dificuldade_final: 7,
        calorias_estimadas_total: 2400,
        tempo_estimado_diario: 45,
        ativo: true
      }
    ];

    console.log('📝 Criando programas temáticos...');
    for (const programData of programs) {
      const [program, created] = await ThematicProgram.findOrCreate({
        where: { nome: programData.nome },
        defaults: programData
      });
      if (created) {
        console.log(`✅ Programa criado: ${program.nome}`);
      } else {
        console.log(`⚠️ Programa já existe: ${program.nome}`);
      }
    }

    console.log('🎉 Seeders executados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seeders:', error);
    process.exit(1);
  }
}

seedData();
