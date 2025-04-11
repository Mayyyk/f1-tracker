import express from "express";
import cors from "cors";
import helmet from "helmet";
import raceRoutes from "./routes/races.js"


const app = express();

const PORT = 5000;

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
      "https://twojadomena.pl",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/races", raceRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
