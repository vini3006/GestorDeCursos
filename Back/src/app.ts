import dotenv from "dotenv";//arquivo que efetivamente roda a aplicação.
dotenv.config();

import express from "express"; 
import userRouter from "./routes/user-account-route";
import periodRouter from "./routes/period-route";
import subjectRouter from "./routes/subject-route";

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/period", periodRouter);
app.use("/subject", subjectRouter);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
    