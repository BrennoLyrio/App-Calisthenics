'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se as colunas já existem e criar se não existirem
    const tableDescription = await queryInterface.describeTable('community_posts');
    
    // Adicionar created_at se não existir
    if (!tableDescription.created_at) {
      // Se existe createdAt, renomear para created_at
      if (tableDescription.createdAt) {
        await queryInterface.renameColumn('community_posts', 'createdAt', 'created_at');
      } else {
        // Se não existe nenhuma, criar created_at
        await queryInterface.addColumn('community_posts', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }
    }
    
    // Adicionar updated_at se não existir
    if (!tableDescription.updated_at) {
      // Se existe updatedAt, renomear para updated_at
      if (tableDescription.updatedAt) {
        await queryInterface.renameColumn('community_posts', 'updatedAt', 'updated_at');
      } else {
        // Se não existe nenhuma, criar updated_at
        await queryInterface.addColumn('community_posts', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Não fazemos rollback para manter consistência
    // Se necessário, pode renomear de volta para camelCase
  }
};
