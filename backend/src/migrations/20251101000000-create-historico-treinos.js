'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if table already exists
    const [tables] = await queryInterface.sequelize.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'historico_treinos'
    `);

    if (tables.length === 0) {
      await queryInterface.createTable('historico_treinos', {
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
        id_treino: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'treinos',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        nome_treino: {
          type: Sequelize.STRING(200),
          allowNull: true,
          comment: 'Nome do treino (para treinos dinâmicos sem ID)',
        },
        data_execucao: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        duracao: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: 'Duração em segundos',
        },
        series_realizadas: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        repeticoes_realizadas: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        notas: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        avaliacao_dificuldade: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'De 1 a 10',
        },
        calorias_queimadas: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        batimentos_medio: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        satisfacao: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'De 1 a 5',
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

      // Create index on id_usuario for faster queries
      await queryInterface.addIndex('historico_treinos', ['id_usuario'], {
        name: 'idx_historico_treinos_usuario',
      });

      // Create index on data_execucao for faster date queries
      await queryInterface.addIndex('historico_treinos', ['data_execucao'], {
        name: 'idx_historico_treinos_data',
      });

      console.log('✅ Tabela historico_treinos criada com sucesso');
    } else {
      console.log('ℹ️  Tabela historico_treinos já existe');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('historico_treinos');
  }
};

