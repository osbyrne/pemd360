import { Context, Effect, Layer } from "effect";
import type { MpSdk } from "@matterport/sdk";
import { MatterportError } from "$lib/effect/errors";

export type MatterportMode = "NPM" | "Script";
export type MatterportTagDescriptor = MpSdk.Tag.Descriptor;
export type MatterportIntersection = MpSdk.Pointer.Intersection;

export type MatterportConnection = {
  readonly addTag: (descriptor: MatterportTagDescriptor) => Effect.Effect<string, MatterportError>;
  readonly removeTag: (id: string) => Effect.Effect<void, MatterportError>;
  readonly subscribePointer: (
    listener: (intersection: MatterportIntersection) => void,
  ) => Effect.Effect<() => void, MatterportError>;
  readonly disconnect: () => Effect.Effect<void, MatterportError>;
};

export interface MatterportService {
  readonly connect: (input: {
    readonly mode: MatterportMode;
    readonly sdkKey: string;
    readonly iframe: HTMLIFrameElement;
    readonly timeoutMs?: number;
  }) => Effect.Effect<MatterportConnection, MatterportError>;
}

export class Matterport extends Context.Tag("pemd360/Matterport")<
  Matterport,
  MatterportService
>() {}

export type MatterportConnectors = {
  readonly npm?: (sdkKey: string, iframe: HTMLIFrameElement) => Promise<MpSdk>;
  readonly script?: (sdkKey: string, iframe: HTMLIFrameElement) => Promise<MpSdk>;
};

export function makeMatterportService(connectors: MatterportConnectors = {}): MatterportService {
  const connectNpm = connectors.npm ?? defaultNpmConnector;
  const connectScript = connectors.script ?? defaultScriptConnector;

  return {
    connect: (input) =>
      Effect.tryPromise({
        try: () =>
          withTimeout(
            input.mode === "NPM"
              ? () => connectNpm(input.sdkKey, input.iframe)
              : () => connectScript(input.sdkKey, input.iframe),
            input.timeoutMs ?? 30_000,
          ),
        catch: (cause) =>
          new MatterportError({
            message: "La connexion Matterport a échoué",
            operation: "matterport.connect",
            cause,
          }),
      }).pipe(Effect.map(createMatterportConnection)),
  };
}

export const MatterportLive = Layer.succeed(Matterport, makeMatterportService());

export function createMatterportConnection(sdk: MpSdk): MatterportConnection {
  let disconnected = false;

  return {
    addTag: (descriptor) =>
      Effect.tryPromise({
        try: async () => {
          const [id] = await sdk.Tag.add(descriptor);
          if (!id) throw new Error("Matterport did not return a tag id");
          return id;
        },
        catch: (cause) => matterportError("matterport.tag.add", cause),
      }),
    removeTag: (id) =>
      Effect.tryPromise({
        try: () => sdk.Tag.remove(id),
        catch: (cause) => matterportError("matterport.tag.remove", cause),
      }),
    subscribePointer: (listener) =>
      Effect.try({
        try: () => sdk.Pointer.intersection.subscribe(listener),
        catch: (cause) => matterportError("matterport.pointer.subscribe", cause),
      }).pipe(Effect.map((subscription) => () => subscription.cancel())),
    disconnect: () =>
      Effect.try({
        try: () => {
          if (!disconnected) {
            disconnected = true;
            sdk.disconnect();
          }
        },
        catch: (cause) => matterportError("matterport.disconnect", cause),
      }),
  };
}

export function waitForIframeLoad(iframe: HTMLIFrameElement, timeoutMs = 10_000): Promise<void> {
  if (iframe.contentDocument?.readyState === "complete") return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      iframe.removeEventListener("load", handleLoad);
      reject(new Error("Matterport iframe load timed out"));
    }, timeoutMs);
    const handleLoad = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      iframe.removeEventListener("load", handleLoad);
      resolve();
    };
    iframe.addEventListener("load", handleLoad, { once: true });
  });
}

async function defaultNpmConnector(sdkKey: string, iframe: HTMLIFrameElement): Promise<MpSdk> {
  const { setupSdk } = await import("@matterport/sdk");
  return setupSdk(sdkKey, { iframe });
}

async function defaultScriptConnector(sdkKey: string, iframe: HTMLIFrameElement): Promise<MpSdk> {
  const sdkModule = await import("$lib/sdk.es6.js");
  return (await sdkModule.connect(iframe, { applicationKey: sdkKey })) as MpSdk;
}

function withTimeout<A>(connect: () => Promise<A>, timeoutMs: number): Promise<A> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      reject(new Error("Matterport connection timed out"));
    }, timeoutMs);

    connect().then(
      (value) => {
        if (settled) {
          disconnectLateConnection(value);
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(value);
      },
      (cause: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(cause);
      },
    );
  });
}

function disconnectLateConnection(value: unknown) {
  if (!isRecord(value) || typeof value.disconnect !== "function") return;
  try {
    Promise.resolve(value.disconnect()).catch(() => undefined);
  } catch {
    // The connection arrived after timeout; there is no current owner to notify.
  }
}

function matterportError(operation: string, cause: unknown) {
  return new MatterportError({
    message: "Une opération Matterport a échoué",
    operation,
    cause,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
