import dotenv from "dotenv";//arquivo que efetivamente roda a aplicação.
dotenv.config();

import express from "express"; 
import userRouter from "./routes/user-account-route";
import semesterRouter from "./routes/semester-route";
import subjectRouter from "./routes/subject-route";
import classRouter from "./routes/class-route"
import courseRouter from "./routes/course-route"
import notificationRouter from "./routes/notification-route"
import reportRouter from "./routes/report-route"

const app = express();
app.use(express.json());

app.use("/users", userRouter);
app.use("/semester", semesterRouter);
app.use("/subject", subjectRouter);
app.use("/class", classRouter);
app.use("/course", courseRouter);
app.use("/notifications", notificationRouter);
app.use("/reports", reportRouter);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
    