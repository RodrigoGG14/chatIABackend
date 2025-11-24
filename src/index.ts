import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import UserRoutes from "./users/infrastructure/routes/User.routes";
import ConversationRoutes from "./conversations/infrastructure/routes/Conversation.routes";
import MessageRoutes from "./messages/infrastructure/routes/Message.routes";
import ConversationAssistanceRoutes from "./conversationAssistances/infrastructure/routes/ConversationAssistance.routes";
import Authrouter from "./auth/infrastructure/routes/AuthRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", UserRoutes);
app.use("/api/v1", ConversationRoutes);
app.use("/api/v1", MessageRoutes);
app.use("/api/v1", ConversationAssistanceRoutes);
app.use("/api/v1", Authrouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
