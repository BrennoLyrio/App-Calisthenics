'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('exercicios');

    if (!table.tipo) {
      await queryInterface.addColumn('exercicios', 'tipo', {
        type: Sequelize.ENUM('timer', 'reps'),
        allowNull: false,
        defaultValue: 'reps'
      });
    }

    if (!table.tempo_estimado) {
      await queryInterface.addColumn('exercicios', 'tempo_estimado', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    if (!table.repeticoes_estimadas) {
      await queryInterface.addColumn('exercicios', 'repeticoes_estimadas', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('exercicios');

    if (table.repeticoes_estimadas) {
      await queryInterface.removeColumn('exercicios', 'repeticoes_estimadas');
    }
    if (table.tempo_estimado) {
      await queryInterface.removeColumn('exercicios', 'tempo_estimado');
    }
    if (table.tipo) {
      await queryInterface.removeColumn('exercicios', 'tipo');
    }
  }
};


