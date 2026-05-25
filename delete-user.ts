import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const emails = ['ju.arango.fcalma@gmail.com', 'el.arango.fcalma@gmail.com'];
  for (const email of emails) {
    try {
      await prisma.usuarios.delete({
        where: { email },
      });
      console.log(`Usuario ${email} eliminado correctamente.`);
    } catch (error) {
      console.log(`Usuario ${email} no se pudo eliminar (quizás ya no existe).`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
