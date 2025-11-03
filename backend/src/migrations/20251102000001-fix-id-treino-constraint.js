'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the foreign key constraint first
    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      DROP CONSTRAINT IF EXISTS historico_treinos_id_treino_fkey;
    `);
    console.log('✅ Dropped foreign key constraint');

    // Now make id_treino nullable
    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      ALTER COLUMN id_treino DROP NOT NULL;
    `);
    console.log('✅ Made id_treino nullable');

    // Re-add the foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      ADD CONSTRAINT historico_treinos_id_treino_fkey 
      FOREIGN KEY (id_treino) 
      REFERENCES treinos(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
    console.log('✅ Re-added foreign key constraint');
  },

  async down(queryInterface, Sequelize) {
    // Revert: make NOT NULL and remove foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      DROP CONSTRAINT IF EXISTS historico_treinos_id_treino_fkey;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      ALTER COLUMN id_treino SET NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE historico_treinos 
      ADD CONSTRAINT historico_treinos_id_treino_fkey 
      FOREIGN KEY (id_treino) 
      REFERENCES treinos(id) 
      ON UPDATE CASCADE 
      ON DELETE CASCADE;
    `);
  }
};

