import express from "express";
import cors from "cors";
import helmet from "helmet";
import raceRoutes from "./routes/races.js"
import dotenv from 'dotenv-flow';
dotenv.config();

const app = express();

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

if (process.env.NODE_ENV === "production") {
  console.log("Running in production with Railway DB");
} else {
  console.log("Running in dev with local DB");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

