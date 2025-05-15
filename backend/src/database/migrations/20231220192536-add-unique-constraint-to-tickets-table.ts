import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      // Tenta remover a constraint existente se ela existir
      await queryInterface.removeConstraint("Tickets", "contactid_companyid_unique");
    } catch (error) {
      // Ignora o erro se a constraint não existir
      console.log("Constraint anterior não encontrada, continuando...");
    }

    // Adiciona a nova constraint
    return queryInterface.addConstraint("Tickets", ["contactId", "companyId", "whatsappId"], {
      type: "unique",
      name: "contactid_companyid_unique"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      return await queryInterface.removeConstraint(
        "Tickets",
        "contactid_companyid_unique"
      );
    } catch (error) {
      console.log("Erro ao remover constraint:", error);
      return Promise.resolve();
    }
  }
};
