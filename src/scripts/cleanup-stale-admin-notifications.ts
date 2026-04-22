import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 20000,
});

const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const staleNotifications = await db.notification.findMany({
    where: {
      title: "New user registration",
      link: "/admin/users",
    },
    select: {
      id: true,
      title: true,
      message: true,
      messageAr: true,
      createdAt: true,
      userId: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const staleIds: string[] = [];

  for (const notification of staleNotifications) {
    const referencedUser = await db.user.findFirst({
      where: {
        OR: [
          { email: { contains: notification.message.split(" ")[0], mode: "insensitive" } },
          { ownerProfile: { is: { fullName: { equals: notification.message.split(" (")[0], mode: "insensitive" } } } },
          { contractorProfile: { is: { companyName: { equals: notification.message.split(" (")[0], mode: "insensitive" } } } },
          { engineerProfile: { is: { fullName: { equals: notification.message.split(" (")[0], mode: "insensitive" } } } },
        ],
      },
      select: { id: true },
    });

    if (!referencedUser) {
      staleIds.push(notification.id);
    }
  }

  if (staleIds.length === 0) {
    console.log(JSON.stringify({ deleted: 0, ids: [] }, null, 2));
    return;
  }

  const result = await db.notification.deleteMany({ where: { id: { in: staleIds } } });
  console.log(JSON.stringify({ deleted: result.count, ids: staleIds }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
