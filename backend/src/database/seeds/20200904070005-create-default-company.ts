import { QueryInterface } from "sequelize";
import bcrypt from "bcryptjs";

module.exports = {
  up: async (queryInterface) => {
    try {
      // Primeiro, remove o usuário existente
      await queryInterface.sequelize.query(
        'DELETE FROM "Users" WHERE email = \'contato@empresa1.com\''
      );

      // Usa o hash que sabemos que funciona
      const passwordHash = '$2a$08$b4wYAZ7MZm4sbbKeksn9Ae1vIA7yfRgLP2IcitcOiKQb5BfsXnEAq';

      // Cria um novo usuário
      await queryInterface.sequelize.query(
        `INSERT INTO "Users" (
          name, 
          email, 
          "passwordHash", 
          profile, 
          "allTicket", 
          "tokenVersion", 
          "companyId",
          super,
          online,
          "createdAt", 
          "updatedAt"
        ) VALUES (
          'Empresa 1',
          'contato@empresa1.com',
          '${passwordHash}',
          'admin',
          'desabled',
          0,
          1,
          true,
          false,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )`
      );
    } catch (error) {
      console.error("Erro ao executar seed:", error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    try {
      return await queryInterface.bulkDelete("Users", {});
    } catch (error) {
      console.error("Erro ao reverter seed:", error);
      throw error;
    }
  }
};
