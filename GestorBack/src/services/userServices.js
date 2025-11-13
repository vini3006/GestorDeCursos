const database = require("../config/database"); // arquivo para fazer as requisições ao BD

const userServices = {
    getUsers: async() => {
        const users = await database.execute(`select * from usuario;`);
        return users;
    },

    newUser: async(userModel) => {
        const { nome, tipo } = userModel;

        const query = `INSERT INTO usuario (nome, tipo) VALUES (?,?);`;

        const [result] = await database.execute(query, [ nome , tipo ]);

        return result.insertId;
    },

    deleteUser: async(idUser) => {
        const id = Number (idUser);

        const query = `DELETE FROM usuario WHERE id = ?;`;

        const [result] = await database.execute(query, [ id ]);

        return result.affectedRows;
    }
};

module.exports = userServices;