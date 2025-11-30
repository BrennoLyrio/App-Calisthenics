'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'metas'
    `);

    if (tables.length === 0) {
      // Create enum types first
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_metas_tipo" AS ENUM ('curto', 'medio', 'longo');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_metas_status" AS ENUM ('em_andamento', 'concluida', 'pausada');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_metas_categoria" AS ENUM ('forca', 'resistencia', 'flexibilidade', 'perda_peso', 'ganho_massa', 'outro');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryInterface.createTable('metas', {
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
        descricao: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        tipo: {
          type: Sequelize.ENUM('curto', 'medio', 'longo'),
          allowNull: false,
        },
        valor_alvo: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        valor_atual: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        data_inicio: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        data_fim: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('em_andamento', 'concluida', 'pausada'),
          allowNull: false,
          defaultValue: 'em_andamento',
        },
        categoria: {
          type: Sequelize.ENUM('forca', 'resistencia', 'flexibilidade', 'perda_peso', 'ganho_massa', 'outro'),
          allowNull: false,
        },
        unidade_medida: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        meta_semanal: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        observacoes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });

      // Create indexes
      await queryInterface.addIndex('metas', ['id_usuario'], {
        name: 'idx_metas_usuario',
      });

      await queryInterface.addIndex('metas', ['status'], {
        name: 'idx_metas_status',
      });

      await queryInterface.addIndex('metas', ['data_fim'], {
        name: 'idx_metas_data_fim',
      });

      console.log('✅ Tabela metas criada com sucesso');
    } else {
      console.log('ℹ️  Tabela metas já existe');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('metas');
    
    // Drop enum types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_metas_tipo";
      DROP TYPE IF EXISTS "enum_metas_status";
      DROP TYPE IF EXISTS "enum_metas_categoria";
    `);
  }
};

