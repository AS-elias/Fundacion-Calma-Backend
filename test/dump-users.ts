import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.usuarios.findMany({
    select: {
      id: true,
      email: true,
      estado: true,
      rol_id: true,
      password_hash: true,
    },
  });

  fs.writeFileSync('db-users.txt', JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
main();
