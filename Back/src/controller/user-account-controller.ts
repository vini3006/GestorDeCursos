import { Request, Response } from "express"; // Importa tipos básicos do Express.
import userService from "../services/user-account-service"; // Importa o Service que interage com o banco de dados.
import { User } from "../models/user-model"; // Importa o modelo de Usuário.
import { Account } from "../models/account-model"; // Importa o modelo de Conta.
import jwt from "jsonwebtoken"; // Biblioteca para JWT.

// Configuração da Chave Secreta para JWT.
const SECRET = process.env.JWT_SECRET!; // Acessa a chave de segurança no arquivo .env.
if(!SECRET) throw new Error("JWT_SECRET nao definida no .env"); // Verifica se a chave de segurança está configurada.

const userController = {
    /**
     * Lida com a requisição de login.
     * Verifica a matrícula e senha no BD, e retorna um JWT se as credenciais forem válidas.
     */
    login: async(req: Request, res: Response) => { // gerencia os logins
        const {matricula, senha} = req.body;

        const account: any | null = await userService.getAccountByMatricula(matricula);

        if (!account) { // verifica se o usuário correspondente à matricula existe
            return res.status(404).json({msg: "Conta não encontrada!"})
        }   

        if(account.senha != senha){ // verifica se a senha inserida está correta
            return res.status(401).json({msg: "Senha incorreta!"})
        }

        const payload = { // cria o payload (dados) carregado pelo JWT
            matricula: account.matricula,
            tipo: account.tipo,
            cpf: account.cpf
        }

        const token = jwt.sign(payload, SECRET, {expiresIn: "2h"}); // assina o token com validade de 2 horas.

        return res.status(200).json({msg: "Login efetuado com sucesso!", token});
    },

    /**
     * Carrega e retorna os dados (Conta) do usuário atualmente logado.
     * A matrícula é extraída do payload do JWT (req.user).
     */
    getMe: async(req: Request, res: Response) => { // carrega os dados do usuário logado atualmente
        const matricula = (req as any).user.matricula;

        if(!matricula){
            return res.status(400).json({msg: "Matrícula não informada"})
        }

        try{
            const result = await userService.getAccountByMatricula(matricula);
            if(!result){
                return res.status(404).json({msg: "Conta não encontrada!"})
            }

            return res.status(200).json(result);
        }catch(err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao coletar dados!"});
        }
    },

    /**
     * Lista todos os usuários e suas contas do sistema.
     * Rota exclusiva para Administradores.
     */
    getAllUsers: async (req: Request, res: Response) => { // lista todos os usuários presentes no BD
        try {
            const users: any[] = await userService.getAllUsers(); 
            return res.status(200).json(users);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao buscar usuários!" });
        }
    },

    /**
     * Insere um novo usuário e sua primeira conta.
     * Rota exclusiva para Administradores.
     */
    insertUser: async(req: Request, res: Response) => { // realiza a inserção de um novo usuário
        const { cpf, nome, dt_nascimento, email, matricula, senha, dataCriacao, tipo } = req.body; // recebe os dados da aplicação
        
        const newUser = new User(cpf, nome, dt_nascimento, email);
        const newAccount = new Account(matricula, senha, tipo, dataCriacao, cpf);
        try {
            // A lógica de inserção/verificação de existência está no Service.
            const result = await userService.insertUser(newUser, newAccount);
            
            // Verifica se o Service retornou uma mensagem de erro (ex: conta duplicada).
            if (result.msg && result.msg.includes("já possui")) {
                 return res.status(409).json({msg: result.msg});
            }

            return res.status(201).json({msg: "Conta inserida com sucesso!", data: result.newUser});
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao inserir usuário!"})
        }
    },

    /**
     * Permite que o usuário logado atualize seu próprio e-mail e/ou senha.
     */
    updateAccount: async(req: Request, res: Response) => {
        const { email, senha } = req.body;

        if (!email && !senha){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        const loggedUser = (req as any).user // armazena os dados do usuário que está fazendo a requisição (CPF e Matrícula do JWT).
        try{
            const result = await userService.updateAccount( loggedUser.cpf, loggedUser.matricula, { email, senha });
            return res.status(200).json({msg: "Dados atualizados com sucesso!", atualizado: result})
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar dados!"});
        }
    },

    /**
     * Deleta uma conta específica (por Matrícula).
     * Se for a última conta do CPF, o registro do usuário também é deletado.
     * Rota exclusiva para Administradores.
     */
    deleteAccount: async(req: Request, res: Response) => {
        const { matricula } = req.params;

        if(!matricula){
            return res.status(400).json({msg: "Matrícula não informada!"});
        }

        try {
            const result = await userService.deleteAccount(matricula);

            if(result.erro){ // caso ocorra um erro no service (conta não encontrada)
                return res.status(404).json({msg: result.erro})
            }

            return res.status(200).json({msg: "Conta deletada com sucesso!", detalhes: result});
        } catch (err) {
            console.error(err);
            return res.status(500).json({msg: "Erro ao deletar a conta!"})
        }
    },
};

export default userController;