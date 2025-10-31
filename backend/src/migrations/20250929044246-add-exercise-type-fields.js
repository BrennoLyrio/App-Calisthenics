'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('exercicios', 'tipo', {
      type: Sequelize.ENUM('timer', 'reps'),
      allowNull: false,
      defaultValue: 'reps'
    });

    await queryInterface.addColumn('exercicios', 'tempo_estimado', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('exercicios', 'repeticoes_estimadas', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('exercicios', 'repeticoes_estimadas');
    await queryInterface.removeColumn('exercicios', 'tempo_estimado');
    await queryInterface.removeColumn('exercicios', 'tipo');
  }
};
