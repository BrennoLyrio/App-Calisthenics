'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get current date and calculate start/end of current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    // Calculate next week
    const nextWeekStart = new Date(endOfWeek);
    nextWeekStart.setDate(endOfWeek.getDate() + 1);
    nextWeekStart.setHours(0, 0, 0, 0);
    
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    nextWeekEnd.setHours(23, 59, 59, 999);

    // Check if challenges already exist
    const [existingChallenges] = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as count FROM weekly_challenges WHERE ativo = true
    `);

    if (existingChallenges[0].count > 0) {
      console.log('Weekly challenges already exist, skipping seed...');
      return;
    }

    const challenges = [
      {
        titulo: 'Desafio: 309 Flexões em um Dia',
        descricao: 'Complete 309 flexões ao longo do dia. Você pode dividir em quantas séries quiser!',
        data_inicio: startOfWeek,
        data_fim: endOfWeek,
        ativo: true,
      },
      {
        titulo: 'Desafio: 7 Dias de Treino Consecutivos',
        descricao: 'Treine pelo menos 15 minutos por 7 dias seguidos. Consistência é a chave!',
        data_inicio: startOfWeek,
        data_fim: endOfWeek,
        ativo: true,
      },
      {
        titulo: 'Desafio: 500 Agachamentos na Semana',
        descricao: 'Complete 500 agachamentos durante a semana. Divida como preferir!',
        data_inicio: nextWeekStart,
        data_fim: nextWeekEnd,
        ativo: true,
      },
      {
        titulo: 'Desafio: 10 Minutos de Plank Diário',
        descricao: 'Acumule 10 minutos de plank por dia. Pode ser em séries menores!',
        data_inicio: nextWeekStart,
        data_fim: nextWeekEnd,
        ativo: true,
      },
    ];

    await queryInterface.bulkInsert('weekly_challenges', challenges);
    console.log('✅ Weekly challenges seeded successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('weekly_challenges', null, {});
  },
};

