'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rotinas_personalizadas'
    `);

    if (tables.length === 0) {
      // Create rotinas_personalizadas table
      await queryInterface.createTable('rotinas_personalizadas', {
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
        nome: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        descricao: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        duracao_estimada: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        calorias_estimadas: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        ativo: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

      // Create index on id_usuario for faster queries
      await queryInterface.addIndex('rotinas_personalizadas', ['id_usuario'], {
        name: 'idx_rotinas_personalizadas_usuario',
      });
    }

    // Check if rotina_exercicios table already exists
    const [exerciseTables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rotina_exercicios'
    `);

    if (exerciseTables.length === 0) {
      // Create rotina_exercicios table
      await queryInterface.createTable('rotina_exercicios', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_rotina: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'rotinas_personalizadas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        id_exercicio: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'exercicios',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        series: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        repeticoes: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        tempo_execucao: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        descanso: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 60,
        },
        ordem: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        observacoes: {
          type: Sequelize.TEXT,
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
      await queryInterface.addIndex('rotina_exercicios', ['id_rotina'], {
        name: 'idx_rotina_exercicios_rotina',
      });
      await queryInterface.addIndex('rotina_exercicios', ['id_exercicio'], {
        name: 'idx_rotina_exercicios_exercicio',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order (due to foreign keys)
    await queryInterface.dropTable('rotina_exercicios');
    await queryInterface.dropTable('rotinas_personalizadas');
  }
};


