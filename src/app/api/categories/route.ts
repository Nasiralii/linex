import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, nameAr: true, parentId: true },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[GET /api/categories] DB query failed:", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}