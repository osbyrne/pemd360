import { describe, expect, it, vi } from "vitest";
import { Effect } from "effect";
import type { MpSdk } from "@matterport/sdk";
import { createMatterportConnection, makeMatterportService } from "$lib/client/services/matterport";

function fakeSdk(overrides: Record<string, unknown> = {}): MpSdk {
  return {
    Tag: {
      add: async () => ["tag-1"],
      remove: async () => undefined,
    },
    Pointer: {
      intersection: {
        subscribe: () => ({ cancel: () => undefined }),
      },
    },
    disconnect: () => undefined,
    ...overrides,
  } as unknown as MpSdk;
}

describe("Matterport service adapter", () => {
  it("disconnects a connection that resolves after the connection timeout", async () => {
    let resolveConnection: ((sdk: MpSdk) => void) | undefined;
    const sdk = fakeSdk({ disconnect: vi.fn() });
    const service = makeMatterportService({
      npm: () => new Promise((resolve) => (resolveConnection = resolve)),
    });
    const iframe = {} as HTMLIFrameElement;

    const result = await Effect.runPromise(
      service.connect({ mode: "NPM", sdkKey: "key", iframe, timeoutMs: 5 }).pipe(Effect.either),
    );

    expect(result._tag).toBe("Left");
    resolveConnection?.(sdk);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sdk.disconnect).toHaveBeenCalledTimes(1);
  });

  it("makes disconnect idempotent and exposes cancellable pointer subscriptions", async () => {
    const cancel = vi.fn();
    const disconnect = vi.fn();
    const sdk = fakeSdk({
      Pointer: { intersection: { subscribe: () => ({ cancel }) } },
      disconnect,
    });
    const connection = createMatterportConnection(sdk);

    const cleanup = await Effect.runPromise(connection.subscribePointer(() => undefined));
    cleanup();
    await Effect.runPromise(connection.disconnect());
    await Effect.runPromise(connection.disconnect());

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
