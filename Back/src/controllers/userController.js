const userServices = require("../services/userServices");
const User = require("../models/userModel");

const userController = {
    getUsers: async(req, res) => {
        const [users] = await userServices.getUsers();
        res.status(200).json(users);
    },

    newUser: async(req, res) => {
        const { nome, tipo } = req.body;
        const user = new User( nome, tipo );

        const id = await userServices.newUser(user);
        res.status(200).json({id:id, message: `${user.nome} inserido com sucesso.`})
    },

    deleteUser: async(req, res) => {
        const {id} = req.body;

        await userServices.deleteUser(id);
        res.status(200).json({id:id, message: `Usuário excluído com sucesso.`});
    }
};

module.exports = userController;