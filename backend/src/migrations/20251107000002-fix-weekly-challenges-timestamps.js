'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if createdAt exists (camelCase from migration)
    const [tableInfo] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'weekly_challenges' 
      AND column_name IN ('createdAt', 'created_at')
    `);

    const hasCreatedAt = tableInfo.some(col => col.column_name === 'createdAt');
    const hasCreated_at = tableInfo.some(col => col.column_name === 'created_at');

    // If we have camelCase columns, update existing records first, then rename
    if (hasCreatedAt && !hasCreated_at) {
      // First, update existing records to have values in createdAt/updatedAt if null
      await queryInterface.sequelize.query(`
        UPDATE weekly_challenges 
        SET "createdAt" = COALESCE("createdAt", NOW()),
            "updatedAt" = COALESCE("updatedAt", NOW())
        WHERE "createdAt" IS NULL OR "updatedAt" IS NULL;
      `);

      // Rename columns from camelCase to snake_case
      await queryInterface.sequelize.query(`
        ALTER TABLE weekly_challenges 
        RENAME COLUMN "createdAt" TO created_at;
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE weekly_challenges 
        RENAME COLUMN "updatedAt" TO updated_at;
      `);
    } else if (!hasCreated_at) {
      // If neither exists, create the columns with proper values for existing records
      await queryInterface.sequelize.query(`
        ALTER TABLE weekly_challenges 
        ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    // Check what columns exist
    const [tableInfo] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'weekly_challenges' 
      AND column_name IN ('createdAt', 'created_at')
    `);

    const hasCreated_at = tableInfo.some(col => col.column_name === 'created_at');

    if (hasCreated_at) {
      // Rename back to camelCase
      await queryInterface.sequelize.query(`
        ALTER TABLE weekly_challenges 
        RENAME COLUMN created_at TO "createdAt";
      `);

      await queryInterface.sequelize.query(`
        ALTER TABLE weekly_challenges 
        RENAME COLUMN updated_at TO "updatedAt";
      `);
    }
  },
};

