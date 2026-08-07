import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";
import { getHomepageSettings } from "@/lib/settings";

// GET /api/settings — public (storefront reads homepage config)
export async function GET() {
  return NextResponse.json(await getHomepageSettings());
}

// PATCH /api/settings — admin updates homepage config
export async function PATCH(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("ads");
    const body = await req.json();
    const current = await getHomepageSettings();
    const merged = { ...current, ...body };
    await prisma.siteSetting.upsert({
      where: { key: "homepage" },
      update: { value: JSON.stringify(merged) },
      create: { key: "homepage", value: JSON.stringify(merged) },
    });
    await logActivity({ adminId, action: "UPDATE", entity: "SiteSetting", detail: "homepage" });
    return NextResponse.json(merged);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}
