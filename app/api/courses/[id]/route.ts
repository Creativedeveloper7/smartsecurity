import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // @ts-ignore - Course model will be available after Prisma client regeneration
    await (prisma as any).course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}

