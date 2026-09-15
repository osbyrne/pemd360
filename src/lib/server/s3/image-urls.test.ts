import { describe, expect, it, vi } from "vitest";
import { createImageUrlResolver } from "$lib/server/s3/image-urls";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("image URL resolution", () => {
  it("keeps extension order and caches the object key, not the signed URL", async () => {
    const headCalls: string[] = [];
    const signCalls: string[] = [];
    const resolver = createImageUrlResolver({
      headObject: async (key) => {
        headCalls.push(key);
        if (!key.endsWith(".png")) throw { name: "NotFound" };
      },
      signObject: async (key) => {
        signCalls.push(key);
        return `signed:${key}:${signCalls.length}`;
      },
    });

    await expect(resolver("hash", ["jpg", "png"])).resolves.toBe("signed:hash.png:1");
    await expect(resolver("hash", ["jpg", "png"])).resolves.toBe("signed:hash.png:2");
    expect(headCalls).toEqual(["hash.jpg", "hash.png"]);
    expect(signCalls).toEqual(["hash.png", "hash.png"]);
  });

  it("does not cache a missing result beyond its expiry", async () => {
    let timestamp = 100;
    let available = false;
    let headCalls = 0;
    const resolver = createImageUrlResolver(
      {
        headObject: async () => {
          headCalls += 1;
          if (!available) throw { name: "NoSuchKey" };
        },
        signObject: async (key) => `signed:${key}`,
      },
      { ttlMs: 10, now: () => timestamp },
    );

    await expect(resolver("hash", ["jpg"])).resolves.toBeNull();
    available = true;
    timestamp = 105;
    await expect(resolver("hash", ["jpg"])).resolves.toBeNull();
    timestamp = 111;
    await expect(resolver("hash", ["jpg"])).resolves.toBe("signed:hash.jpg");
    expect(headCalls).toBe(2);
  });

  it("removes provider failures so a recovered provider can be retried", async () => {
    let fail = true;
    let headCalls = 0;
    const resolver = createImageUrlResolver({
      headObject: async () => {
        headCalls += 1;
        if (fail) throw new Error("network down");
      },
      signObject: async (key) => `signed:${key}`,
    });

    await expect(resolver("hash", ["jpg"])).rejects.toThrow("network down");
    fail = false;
    await expect(resolver("hash", ["jpg"])).resolves.toBe("signed:hash.jpg");
    expect(headCalls).toBe(2);
  });
});
