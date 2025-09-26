'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change avatar column from VARCHAR(255) to TEXT to accommodate base64 images
    await queryInterface.changeColumn('Users', 'avatar', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert avatar column back to VARCHAR(255)
    await queryInterface.changeColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
