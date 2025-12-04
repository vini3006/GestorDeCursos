import { Request, Response } from "express"; //arquivo responsável por gerenciar as requisições e chamar as funções do service
import userService from "../services/user-account-service";
import { User } from "../models/user-model";
import { Account } from "../models/account-model";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!; //acessa a chave de segurança no arquivo .env
if(!SECRET) throw new Error("JWT_SECRET nao definida no .env"); //verifica se a chave de segurança está configurada

const userController = {
    login: async(req: Request, res: Response) => { //gerencia os logins
        const {matricula, senha} = req.body;

        const account: Account | null = await userService.getAccountByMatricula(matricula);

        if (!account) { //verifica se o usuário correspondente à matricula existe
            return res.status(404).json({msg: "Conta não encontrada!"})
        }   

        if(account.senha != senha){ //verifica se a senha inserida está correta
            return res.status(401).json({msg: "Senha incorreta!"})
        }

        const payload = { //cria o payload (dados) carregado pelo JWT
            matricula: account.matricula,
            tipo: account.tipo,
            cpf: account.cpf
        }

        const token = jwt.sign(payload, SECRET, {expiresIn: "2h"}); //assina o token

        return res.status(200).json({msg: "Login efetuado com sucesso!", token});
    },

    getAllUsers: async (req: Request, res: Response) => { //lista todos os usuários presentes no BD
        try {
            const users: User[] = await userService.getAllUsers(); 
            return res.status(200).json(users);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ msg: "Erro ao buscar usuários!" });
        }
    },

    insertUser: async(req: Request, res: Response) => { //realiza a inserção de um novo usuário
        const { cpf, nome, dt_nascimento, email, matricula, senha, dataCriacao, tipo } = req.body; //recebe os dados da aplicação
        
        const newUser = new User(cpf, nome, dt_nascimento, email);
        const newAccount = new Account(matricula, senha, tipo, dataCriacao, cpf);
        try {
            await userService.insertUser(newUser, newAccount);
            return res.status(200).json({msg: "Conta inserida com sucesso!"})
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao inserir usuário!"})
        }
    },

    updateAccount: async(req: Request, res: Response) => {
        const { email, senha } = req.body;

        if (!email && !senha){
            return res.status(400).json({msg: "Nada para atualizar!"});
        }

        const loggedUser = (req as any).user //armazena os dados do usuário que está fazendo a requisição
        try{
            const result = await userService.updateAccount( loggedUser.cpf, loggedUser.matricula, { email, senha });
            return res.status(200).json({msg: "Dados atualizados com sucesso!", atualizado: result})
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao atualizar dados!"});
        }
    },

    deleteAccount: async(req: Request, res: Response) => {
        const { matricula } = req.params;

        if(!matricula){
            return res.status(400).json({msg: "Matrícula não informada!"});
        }

        try {
            const result = await userService.deleteAccount(matricula);

            if(result.erro){ //caso ocorra um erro no service
                return res.status(404).json({msg: result.erro})
            }

            return res.status(200).json({msg: "Conta deletada com sucesso!", detalhes: result});
        } catch (err) {
            console.error(err);
            return res.status(500).json({msg: "Erro ao deletar a conta!"})
        }
    },

    getAllAcounts: async(req: Request, res: Response) => {
        try{
            const accounts: Account[] = await userService.getAllAcounts();
            return res.status(200).json(accounts); 
        } catch (err){
            console.error(err);
            return res.status(500).json({msg: "Erro ao buscar contas!"});
        }
    }
};

export default userController;