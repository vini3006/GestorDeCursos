class User {
    constructor(nome, tipo) {
        this.nome = nome;
        this.tipo = tipo; // "administrador", "professor" ou "aluno"
    }
}

module.exports = User;
