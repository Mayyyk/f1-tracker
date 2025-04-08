-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "round" INTEGER NOT NULL,
    "circuit" TEXT NOT NULL,
    "isNightRace" BOOLEAN NOT NULL,
    "temperature" DOUBLE PRECISION,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);
