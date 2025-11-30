'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create weekly_challenges table
    await queryInterface.createTable('weekly_challenges', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      data_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      data_fim: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Create enum types for community_posts
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_community_posts_tipo" AS ENUM ('rank', 'help');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_community_posts_status" AS ENUM ('ativo', 'removido');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 3. Create community_posts table
    await queryInterface.createTable('community_posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipo: {
        type: Sequelize.ENUM('rank', 'help'),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(200),
        allowNull: true, // Nullable for 'rank' posts
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duvida: {
        type: Sequelize.TEXT,
        allowNull: true, // Nullable for 'rank' posts
      },
      video_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      id_desafio_semanal: {
        type: Sequelize.INTEGER,
        allowNull: true, // Nullable for 'help' posts
        references: {
          model: 'weekly_challenges',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      curtidas_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      comentarios_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      data_postagem: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('ativo', 'removido'),
        allowNull: false,
        defaultValue: 'ativo',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 4. Create post_likes table
    await queryInterface.createTable('post_likes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_post: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'community_posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 5. Create unique constraint for post_likes (one like per user per post)
    await queryInterface.addIndex('post_likes', ['id_post', 'id_usuario'], {
      unique: true,
      name: 'post_likes_unique_user_post',
    });

    // 6. Create post_comments table
    await queryInterface.createTable('post_comments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_post: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'community_posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      texto: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 7. Create indexes for better performance
    await queryInterface.addIndex('community_posts', ['id_usuario']);
    await queryInterface.addIndex('community_posts', ['tipo']);
    await queryInterface.addIndex('community_posts', ['id_desafio_semanal']);
    await queryInterface.addIndex('community_posts', ['data_postagem']);
    await queryInterface.addIndex('community_posts', ['curtidas_count']);
    await queryInterface.addIndex('post_likes', ['id_post']);
    await queryInterface.addIndex('post_comments', ['id_post']);
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (respecting foreign keys)
    await queryInterface.dropTable('post_comments');
    await queryInterface.dropTable('post_likes');
    await queryInterface.dropTable('community_posts');
    await queryInterface.dropTable('weekly_challenges');

    // Drop enum types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_community_posts_status";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_community_posts_tipo";
    `);
  },
};

