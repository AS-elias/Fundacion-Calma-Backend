import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const users = await prisma.usuarios.findMany();

  console.log(`Encontramos ${users.length} usuarios en la BD.`);

  for (const u of users) {
    console.log(`--- Correo: ${u.email} ---`);
    const matchPassword123 = await bcrypt.compare(
      'password123',
      u.password_hash,
    );
    const matchCalma123 = await bcrypt.compare('calma123', u.password_hash);

    console.log(`  Estado: ${u.estado}`);
    console.log(`  Rol ID: ${u.rol_id}`);
    console.log(`  Match con 'password123': ${matchPassword123}`);
    console.log(`  Match con 'calma123': ${matchCalma123}`);

    if (!matchPassword123 && !matchCalma123) {
      console.log(
        `  [!] ATENCIÓN: El hash en BD no coincide ni con password123 ni calma123. Hash guardado: ${u.password_hash.substring(0, 15)}...`,
      );
    } else if (matchPassword123) {
      console.log(`  [OK] Su contraseña es 'password123'`);
    } else {
      console.log(`  [OK] Su contraseña es 'calma123'`);
    }
  }

  await prisma.$disconnect();
}
main();
