-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quizId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuizCards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QuizCards_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizAnswer_quizId_cardId_key" ON "QuizAnswer"("quizId", "cardId");

-- CreateIndex
CREATE INDEX "_QuizCards_B_index" ON "_QuizCards"("B");

-- CreateIndex
CREATE INDEX "Card_name_idx" ON "Card"("name");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizCards" ADD CONSTRAINT "_QuizCards_A_fkey" FOREIGN KEY ("A") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizCards" ADD CONSTRAINT "_QuizCards_B_fkey" FOREIGN KEY ("B") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
