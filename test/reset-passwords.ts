import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const newHash = await bcrypt.hash('calma123', 10);

  await prisma.usuarios.updateMany({
    data: { password_hash: newHash },
  });

  console.log(
    '✅ Todas las contraseñas han sido actualizadas forzosamente a: calma123',
  );
  await prisma.$disconnect();
}
main();
