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
    
    // Fix post_likes table
    const likesTableDescription = await queryInterface.describeTable('post_likes');
    
    if (!likesTableDescription.created_at && likesTableDescription.createdAt) {
      await queryInterface.renameColumn('post_likes', 'createdAt', 'created_at');
    }
  },

  async down(queryInterface, Sequelize) {
    // Não fazemos rollback para manter consistência
  }
};

