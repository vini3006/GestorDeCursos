import dotenv from "dotenv";//arquivo que efetivamente roda a aplicação.
dotenv.config();

import express from "express"; 
import userRouter from "./routes/user-account-route"

const app = express();
app.use(express.json());

app.use("/users", userRouter);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
