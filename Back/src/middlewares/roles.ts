import { Request, Response, NextFunction } from "express"; // Importa tipos do Express.

/**
 * Função que gera um middleware para restringir o acesso a rotas específicas.
 * O acesso é permitido apenas para usuários com os tipos de conta (roles) fornecidos.
 */
export function allowRoles(...roles: string[]) {
    // Retorna a função de middleware que será executada na rota.
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user; // Obtém os dados do usuário (payload do token) da requisição.

        if(!user){
            // Verifica se o usuário está autenticado.
            return res.status(401).json({msg: "Não autenticado!"});
        }

        if(!roles.includes(user.tipo)) {
            // Verifica se o tipo de conta do usuário está na lista de permissões aceitas.
            return res.status(403).json({msg: "Acesso negado!"}); // Nega o acesso (Forbidden).
        }

        next(); // Permissão concedida.
    }
}