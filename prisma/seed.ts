import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011)
const ALLERGENS: { code: string; name: string }[] = [
  { code: "GLUTEN", name: "Gluten" },
  { code: "CRUSTACEANS", name: "Crustáceos" },
  { code: "EGGS", name: "Huevos" },
  { code: "FISH", name: "Pescado" },
  { code: "PEANUTS", name: "Cacahuetes" },
  { code: "SOY", name: "Soja" },
  { code: "MILK", name: "Lácteos" },
  { code: "NUTS", name: "Frutos de cáscara" },
  { code: "CELERY", name: "Apio" },
  { code: "MUSTARD", name: "Mostaza" },
  { code: "SESAME", name: "Sésamo" },
  { code: "SULPHITES", name: "Sulfitos" },
  { code: "LUPIN", name: "Altramuces" },
  { code: "MOLLUSCS", name: "Moluscos" },
];

async function main() {
  // 1) Administrador
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD en tu .env.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: { email, passwordHash, role: "ADMIN", name: "Administrador" },
  });
  console.log(`✔ Administrador listo: ${admin.email}`);

  // 2) Alérgenos
  for (const a of ALLERGENS) {
    await prisma.allergen.upsert({
      where: { code: a.code },
      update: { name: a.name },
      create: a,
    });
  }
  console.log(`✔ ${ALLERGENS.length} alérgenos listos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
