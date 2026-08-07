import { prisma } from "./prisma";

export const DEFAULT_HOMEPAGE = {
  heroBadge: "Delivering 2 PM – 3 AM Daily",
  menuTitle: "Our Menu",
  menuSubtitle: "Browse the full catalog of active products",
  reserveTitle: "The Reserve",
  reserveSubtitle: "Rare imports, single malts & limited editions",
  showSpecials: true,
  showVip: true,
  showWhyUs: true,
  showHowItWorks: true,
  showContact: true,
  showBrands: true,
  showReserve: true,
};

export type HomepageSettings = typeof DEFAULT_HOMEPAGE;

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "homepage" } });
    if (!row) return DEFAULT_HOMEPAGE;
    return { ...DEFAULT_HOMEPAGE, ...JSON.parse(row.value) };
  } catch {
    return DEFAULT_HOMEPAGE;
  }
}
