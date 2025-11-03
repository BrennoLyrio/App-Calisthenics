'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new values to the categoria enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_exercicios_categoria" ADD VALUE IF NOT EXISTS 'aquecimento';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_exercicios_categoria" ADD VALUE IF NOT EXISTS 'alongamento';
    `);
  },

  async down (queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the entire enum type
    // For now, we'll leave this empty as it's a rare operation
    console.log('Warning: Removing enum values is not fully supported in PostgreSQL');
  }
};
