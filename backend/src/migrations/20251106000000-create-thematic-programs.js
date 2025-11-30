'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if programas_tematicos table already exists
    const [programsTables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'programas_tematicos'
    `);

    if (programsTables.length === 0) {
      // Create enum type for categoria
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_programas_tematicos_categoria" AS ENUM ('desafio', 'programa', 'curso');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create enum type for nivel_requerido
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_programas_tematicos_nivel_requerido" AS ENUM ('iniciante', 'intermediario', 'avancado');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create programas_tematicos table
      await queryInterface.createTable('programas_tematicos', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        nome: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        descricao: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        duracao_dias: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        certificado_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        nivel_requerido: {
          type: Sequelize.ENUM('iniciante', 'intermediario', 'avancado'),
          allowNull: false,
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        categoria: {
          type: Sequelize.ENUM('desafio', 'programa', 'curso'),
          allowNull: false,
        },
        objetivo_principal: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        exercicios_incluidos: {
          type: Sequelize.ARRAY(Sequelize.INTEGER),
          allowNull: false,
          defaultValue: [],
        },
        requisitos: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: false,
          defaultValue: [],
        },
        beneficios: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: false,
          defaultValue: [],
        },
        dificuldade_inicial: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        dificuldade_final: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        calorias_estimadas_total: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        tempo_estimado_diario: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        imagem_url: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        video_apresentacao: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create index on categoria and nivel_requerido
      await queryInterface.addIndex('programas_tematicos', ['categoria'], {
        name: 'idx_programas_tematicos_categoria',
      });
      await queryInterface.addIndex('programas_tematicos', ['nivel_requerido'], {
        name: 'idx_programas_tematicos_nivel',
      });
      await queryInterface.addIndex('programas_tematicos', ['ativo'], {
        name: 'idx_programas_tematicos_ativo',
      });
    }

    // Check if usuario_programas table already exists
    const [userProgramsTables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usuario_programas'
    `);

    if (userProgramsTables.length === 0) {
      // Create enum type for status
      await queryInterface.sequelize.query(`
        DO $$ BEGIN
          CREATE TYPE "enum_usuario_programas_status" AS ENUM ('ativo', 'concluido', 'pausado');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);

      // Create usuario_programas table
      await queryInterface.createTable('usuario_programas', {
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
        id_programa: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'programas_tematicos',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        progresso: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.ENUM('ativo', 'concluido', 'pausado'),
          allowNull: false,
          defaultValue: 'ativo',
        },
        data_inicio: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        data_fim: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        dias_concluidos: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        ultima_atividade: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        notas: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        avaliacao: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Create indexes
      await queryInterface.addIndex('usuario_programas', ['id_usuario'], {
        name: 'idx_usuario_programas_usuario',
      });
      await queryInterface.addIndex('usuario_programas', ['id_programa'], {
        name: 'idx_usuario_programas_programa',
      });
      await queryInterface.addIndex('usuario_programas', ['status'], {
        name: 'idx_usuario_programas_status',
      });
      
      // Create unique constraint to prevent duplicate enrollments
      await queryInterface.addIndex('usuario_programas', ['id_usuario', 'id_programa'], {
        unique: true,
        name: 'idx_usuario_programas_unique',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario_programas');
    await queryInterface.dropTable('programas_tematicos');
    
    // Drop enum types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_usuario_programas_status";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_programas_tematicos_categoria";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_programas_tematicos_nivel_requerido";
    `);
  }
};

