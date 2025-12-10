import { test, expect } from "@playwright/test";

test("escape-runs CRUD works", async ({ request }) => {
  const create = await request.post("/api/escape-runs", {
    data: {
      scenarioId: "debug-crypt",
      scenarioName: "Debug Crypt (Medium)",
      runName: "Playwright run",
      success: true,
      durationSeconds: 42,
      stages: [{ stageId: "m1", title: "Stage 1", index: 0, timeLimitSeconds: 60, answer: "debug" }],
    },
  });
  expect(create.status()).toBe(201);
  const created = await create.json();
  expect(created.id).toBeTruthy();

  const id = created.id as string;

  const list = await request.get(`/api/escape-runs?scenarioId=debug-crypt`);
  expect(list.ok()).toBeTruthy();
  const runs = await list.json();
  expect(Array.isArray(runs)).toBeTruthy();

  const patch = await request.patch("/api/escape-runs", { data: { id, runName: "Renamed by Playwright" } });
  expect(patch.ok()).toBeTruthy();
  const updated = await patch.json();
  expect(updated.runName).toBe("Renamed by Playwright");

  const del = await request.delete(`/api/escape-runs?id=${encodeURIComponent(id)}`);
  expect(del.ok()).toBeTruthy();
});
