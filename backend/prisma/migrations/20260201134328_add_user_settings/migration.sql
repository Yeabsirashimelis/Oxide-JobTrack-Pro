-- AlterEnum
ALTER TYPE "ReminderStatus" ADD VALUE 'DISMISSED';

-- AlterEnum
ALTER TYPE "ReminderType" ADD VALUE 'GENERAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "browserNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "defaultFollowUpDays" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "interviewReminderDays" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weeklySummary" BOOLEAN NOT NULL DEFAULT true;
