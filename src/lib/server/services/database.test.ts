import { describe, expect, it, vi } from "vitest";
import { Effect } from "effect";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { makeDatabaseService } from "./database";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("database transport failures", () => {
  it("retries a transient read, while mutations and SQL errors run once", async () => {
    const client = createClient({ url: ":memory:" });
    const service = makeDatabaseService(() => drizzle(client));
    try {
      const transient = Object.assign(new Error("socket closed"), { code: "UND_ERR_SOCKET" });
      const read = vi.fn().mockRejectedValueOnce(transient).mockResolvedValueOnce(42);
      expect(await Effect.runPromise(service.read("test.read", read))).toBe(42);
      expect(read).toHaveBeenCalledTimes(2);
      const unavailable = vi.fn().mockRejectedValue(transient);
      expect(
        await Effect.runPromise(service.read("test.unavailable", unavailable).pipe(Effect.result)),
      ).toMatchObject({ _tag: "Failure", failure: { _tag: "DatabaseError" } });
      expect(unavailable).toHaveBeenCalledTimes(3);
      for (const [method, error] of [
        ["run", transient],
        ["read", new Error("no such column")],
      ] as const) {
        const operation = vi.fn().mockRejectedValue(error);
        const result = await Effect.runPromise(
          service[method]("test.operation", operation).pipe(Effect.result),
        );
        expect(result).toMatchObject({ _tag: "Failure", failure: { _tag: "DatabaseError" } });
        expect(operation).toHaveBeenCalledTimes(1);
      }
    } finally {
      client.close();
    }
  });
});
