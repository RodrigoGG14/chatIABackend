import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import UserRoutes from "@/users/infrastructure/routes/User.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", UserRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
