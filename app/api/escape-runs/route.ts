import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/escape-runs?scenarioId=debug-crypt
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const scenarioId = url.searchParams.get("scenarioId");

    const runs = await prisma.escapeRun.findMany({
      where: scenarioId ? { scenarioId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        scenarioId: true,
        scenarioName: true,
        runName: true,
        success: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    return NextResponse.json(runs, { status: 200 });
  } catch (err) {
    console.error("GET /api/escape-runs error:", err);
    return NextResponse.json({ error: "Failed to load escape runs" }, { status: 500 });
  }
}

// POST /api/escape-runs
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.escapeRun.create({
      data: {
        scenarioId: String(body.scenarioId ?? ""),
        scenarioName: String(body.scenarioName ?? ""),

        // prefer runName; allow notes as fallback if you want
        runName: body.runName ? String(body.runName) : null,

        success: Boolean(body.success ?? true),
        durationSeconds: Number(body.durationSeconds ?? 0),
        stages: body.stages ?? [],

        // keep notes if you're using it elsewhere
        notes: body.notes ? String(body.notes) : null,
      },
      select: {
        id: true,
        scenarioId: true,
        scenarioName: true,
        runName: true,
        success: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/escape-runs error:", err);
    return NextResponse.json({ error: "Failed to save escape run" }, { status: 500 });
  }
}

// PATCH /api/escape-runs?id=xxxxx   (rename)
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);

    // ✅ Prefer REST style: id in query string
    // Also allow body.id for backward compatibility
    const body = await req.json().catch(() => ({} as any));
    const id = String(url.searchParams.get("id") ?? body?.id ?? "");

    // ✅ Prefer body.name (simple), but accept body.runName too
    const incomingName = body?.name ?? body?.runName ?? null;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // allow clearing name by sending null/empty string
    const runName =
      incomingName === null || incomingName === undefined
        ? null
        : String(incomingName).trim() || null;

    const updated = await prisma.escapeRun.update({
      where: { id },
      data: { runName },
      select: {
        id: true,
        scenarioId: true,
        scenarioName: true,
        runName: true,
        success: true,
        durationSeconds: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/escape-runs error:", err);
    return NextResponse.json({ error: "Failed to rename run" }, { status: 500 });
  }
}

// DELETE /api/escape-runs?id=xxxxx
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.escapeRun.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/escape-runs error:", err);
    return NextResponse.json({ error: "Failed to delete run" }, { status: 500 });
  }
}
