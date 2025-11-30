'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'configuracoes_notificacao'
    `);

    if (tables.length === 0) {
      // Create enum type for frequencia_lembrete
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_configuracoes_notificacao_frequencia_lembrete" AS ENUM ('diario', 'alternado', 'customizado');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      await queryInterface.createTable('configuracoes_notificacao', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_usuario: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'usuarios',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        lembrete_treino_ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        horarios_treino: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        dias_semana: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        frequencia_lembrete: {
          type: Sequelize.ENUM('diario', 'alternado', 'customizado'),
          allowNull: true,
        },
        notificacao_completou_treino: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        notificacao_periodo_sem_treinar: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        dias_sem_treinar_para_alerta: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 3,
        },
        notificacao_dicas_recuperacao: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        notificacao_meta_alcancada: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

      // Create index
      await queryInterface.addIndex('configuracoes_notificacao', ['id_usuario'], {
        name: 'idx_configuracoes_notificacao_usuario',
        unique: true,
      });

      console.log('✅ Tabela configuracoes_notificacao criada com sucesso');
    } else {
      console.log('ℹ️  Tabela configuracoes_notificacao já existe');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('configuracoes_notificacao');
    
    // Drop enum type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_configuracoes_notificacao_frequencia_lembrete";
    `);
  }
};

