-- CreateTable
CREATE TABLE "MtgSet" (
    "id" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "setType" TEXT,

    CONSTRAINT "MtgSet_pkey" PRIMARY KEY ("id")
);
