const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = ['Institute', 'User', 'Teacher', 'Student', 'Batch', 'StudentBatch', 'Attendance', 'Fee', 'Result', 'Expense', 'ActivityLog'];
  for (const model of models) {
    const count = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count();
    console.log(`${model}: ${count}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
