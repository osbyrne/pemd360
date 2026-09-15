import { runClientBoundaryEffect } from "$lib/client/effect/runtime";
import type { MatterportConnection } from "$lib/client/services/matterport";

type Vec3 = { x: number; y: number; z: number };

export class PemdEditMode {
  enabled = $state(false);
  lastIntersection: { position: Vec3; normal: Vec3 } | null = $state(null);
  overlay: HTMLDivElement | undefined = $state();

  #connection: MatterportConnection | undefined;
  #onPlaceTag: (position: Vec3, normal: Vec3) => void;
  #cancelPointerSubscription: (() => void) | null = null;
  #subscriptionGeneration = 0;
  #timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(onPlaceTag: (position: Vec3, normal: Vec3) => void) {
    this.#onPlaceTag = onPlaceTag;
  }

  setConnection(connection: MatterportConnection | undefined) {
    this.#stop();
    this.#connection = connection;
    if (this.enabled) this.#start();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.#start();
    } else {
      this.#stop();
    }
  }

  #start() {
    if (!this.#connection) return;
    const generation = ++this.#subscriptionGeneration;
    void runClientBoundaryEffect(
      this.#connection.subscribePointer((data) => {
        if (data?.position && data.normal) {
          this.lastIntersection = { position: data.position, normal: data.normal };
        }
      }),
    ).then((result) => {
      if (result._tag !== "success") return;
      if (generation !== this.#subscriptionGeneration || !this.enabled || !this.#connection) {
        result.value();
        return;
      }
      this.#cancelPointerSubscription = result.value;
    });
  }

  #stop() {
    this.#subscriptionGeneration += 1;
    this.#cancelPointerSubscription?.();
    this.#cancelPointerSubscription = null;
    this.lastIntersection = null;
  }

  handleOverlayClick(event: MouseEvent) {
    if (!this.enabled || !this.lastIntersection) return;
    event.preventDefault();
    event.stopPropagation();
    this.#onPlaceTag(this.lastIntersection.position, this.lastIntersection.normal);
  }

  handleOverlayMouseMove(_event: MouseEvent) {
    if (!this.overlay || !this.enabled) return;
    this.overlay.style.pointerEvents = "none";
    if (this.#timeout) clearTimeout(this.#timeout);
    this.#timeout = setTimeout(() => {
      if (this.overlay && this.enabled) {
        this.overlay.style.pointerEvents = "auto";
      }
    }, 50);
  }

  handleOverlayKeydown(event: KeyboardEvent) {
    if ((event.key === "Enter" || event.key === " ") && this.lastIntersection) {
      this.#onPlaceTag(this.lastIntersection.position, this.lastIntersection.normal);
    }
  }

  cleanup() {
    this.#stop();
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }
  }
}
