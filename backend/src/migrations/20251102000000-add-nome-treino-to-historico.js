'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column already exists
    const table = await queryInterface.describeTable('historico_treinos');
    
    if (!table.nome_treino) {
      await queryInterface.addColumn('historico_treinos', 'nome_treino', {
        type: Sequelize.STRING(200),
        allowNull: true,
      });
      console.log('✅ Added nome_treino column to historico_treinos');
    } else {
      console.log('ℹ️  Column nome_treino already exists');
    }

    // Make id_treino nullable
    const idTreino = table.id_treino;
    if (idTreino && !idTreino.allowNull) {
      await queryInterface.changeColumn('historico_treinos', 'id_treino', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'treinos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      console.log('✅ Made id_treino nullable');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('historico_treinos', 'nome_treino');
    
    // Revert id_treino back to not null (optional)
    // await queryInterface.changeColumn('historico_treinos', 'id_treino', {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    // });
  }
};

