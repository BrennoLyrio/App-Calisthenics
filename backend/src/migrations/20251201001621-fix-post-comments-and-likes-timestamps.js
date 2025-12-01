'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fix post_comments table
    const commentsTableDescription = await queryInterface.describeTable('post_comments');
    
    if (!commentsTableDescription.created_at && commentsTableDescription.createdAt) {
      await queryInterface.renameColumn('post_comments', 'createdAt', 'created_at');
    }
    
    if (!commentsTableDescription.updated_at && commentsTableDescription.updatedAt) {
      await queryInterface.renameColumn('post_comments', 'updatedAt', 'updated_at');
    }
    
    // Se não existir nenhuma das colunas, criar created_at e updated_at
    if (!commentsTableDescription.created_at && !commentsTableDescription.createdAt) {
      await queryInterface.addColumn('post_comments', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    
    if (!commentsTableDescription.updated_at && !commentsTableDescription.updatedAt) {
      await queryInterface.addColumn('post_comments', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
    
    // Fix post_likes table
    const likesTableDescription = await queryInterface.describeTable('post_likes');
    
    if (!likesTableDescription.created_at && likesTableDescription.createdAt) {
      await queryInterface.renameColumn('post_likes', 'createdAt', 'created_at');
    }
    
    // Se não existir nenhuma das colunas, criar created_at
    if (!likesTableDescription.created_at && !likesTableDescription.createdAt) {
      await queryInterface.addColumn('post_likes', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Não fazemos rollback para manter consistência
  }
};
