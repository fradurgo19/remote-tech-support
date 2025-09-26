'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Cambiar la columna attachments de ARRAY(STRING) a ARRAY(TEXT)
    await queryInterface.changeColumn('Reports', 'attachments', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir el cambio
    await queryInterface.changeColumn('Reports', 'attachments', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
  }
};
