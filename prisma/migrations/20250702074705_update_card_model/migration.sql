-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "oracleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL,
    "uri" TEXT NOT NULL,
    "scryfallUri" TEXT NOT NULL,
    "highresImage" BOOLEAN NOT NULL,
    "imageStatus" TEXT NOT NULL,
    "artOnlyUri" TEXT NOT NULL,
    "fullCardUri" TEXT NOT NULL,
    "colors" TEXT[],
    "setId" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "setType" TEXT NOT NULL,
    "setUri" TEXT NOT NULL,
    "setSearchUri" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "artistIds" TEXT[],
    "illustrationId" TEXT NOT NULL,
    "borderColor" TEXT NOT NULL,
    "frame" TEXT NOT NULL,
    "fullArt" BOOLEAN NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);
