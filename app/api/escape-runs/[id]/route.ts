import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const selectRun = {
  id: true,
  scenarioId: true,
  scenarioName: true,
  runName: true,
  success: true,
  durationSeconds: true,
  createdAt: true,
} as const;

// GET /api/escape-runs/[id]
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    const run = await prisma.escapeRun.findUnique({
      where: { id },
      select: selectRun,
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json(run, { status: 200 });
  } catch (err) {
    console.error("GET /api/escape-runs/[id] error:", err);
    return NextResponse.json({ error: "Failed to load run" }, { status: 500 });
  }
}

// PATCH /api/escape-runs/[id]  (rename)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({} as any));

    const runName = body.runName ? String(body.runName) : null;

    const updated = await prisma.escapeRun.update({
      where: { id },
      data: { runName },
      select: selectRun,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/escape-runs/[id] error:", err);
    return NextResponse.json({ error: "Failed to rename run" }, { status: 500 });
  }
}

// DELETE /api/escape-runs/[id]
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;

    await prisma.escapeRun.delete({ where: { id } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/escape-runs/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete run" }, { status: 500 });
  }
}
