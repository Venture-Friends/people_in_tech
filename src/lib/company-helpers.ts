import { prisma } from "@/lib/prisma";

export async function getCompanyForUser(userId: string) {
  const claim = await prisma.companyClaim.findFirst({
    where: {
      userId,
      status: "APPROVED",
    },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!claim) return null;

  return claim.company;
}
