import { Request, Response, NextFunction } from "express"; // arquivo que gerencia as permissões dos usuários de acordo com o tipo

export function allowRoles(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if(!user){
            return res.status(401).json({msg: "Não autenticado!"});
        }

        if(!roles.includes(user.tipo)) {
            return res.status(403).json({msg: "Acesso negado!"});
        }

        next();
    }
}