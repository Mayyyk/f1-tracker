import express from "express";
import cors from "cors";
import helmet from "helmet";
import raceRoutes from "./routes/races.js"
import dotenv from 'dotenv-flow';
import prisma from "./prisma/client.js";
dotenv.config();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
      "https://f1-tracker-rjrhafkn4-michals-projects-a0de64a1.vercel.app",
      "https://f1-tracker-seven.vercel.app",
      "https://f1-tracker-git-main-michals-projects-a0de64a1.vercel.app/"
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

async function init() {
  await prisma.$connect();
  await prisma.$executeRaw`SELECT 1`; // quick test connection
  console.log("Prisma connected");

  // start server AFTER DB is ready
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

console.log("Active DB URL:", process.env.DATABASE_URL);

init();
