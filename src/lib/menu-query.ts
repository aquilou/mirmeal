import { prisma } from "@/lib/prisma";
import { mondayOf } from "@/lib/week";

/** La próxima semana publicada; si no hay, la última publicada. Solo platos con cupo. */
export async function getCurrentWeeklyMenu() {
  const thisMonday = mondayOf(new Date());
  const include = {
    items: {
      where: { capacity: { gt: 0 } },
      include: { dish: { include: { allergens: true } } },
    },
  } as const;

  return (
    (await prisma.weeklyMenu.findFirst({
      where: { published: true, weekStart: { gte: thisMonday } },
      orderBy: { weekStart: "asc" },
      include,
    })) ??
    (await prisma.weeklyMenu.findFirst({
      where: { published: true },
      orderBy: { weekStart: "desc" },
      include,
    }))
  );
}
