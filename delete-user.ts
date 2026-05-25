import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'ju.arango.fcalma@gmail.com';
  try {
    await prisma.usuarios.delete({
      where: { email },
    });
    console.log(`Usuario ${email} eliminado correctamente.`);
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
