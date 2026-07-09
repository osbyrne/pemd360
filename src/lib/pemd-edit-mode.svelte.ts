import type { MpSdk } from "@matterport/sdk";

type Vec3 = { x: number; y: number; z: number };

export class PemdEditMode {
  enabled = $state(false);
  lastIntersection: { position: Vec3; normal: Vec3 } | null = $state(null);
  overlay: HTMLDivElement | undefined = $state();

  #mpSdk: MpSdk | undefined;
  #onPlaceTag: (position: Vec3, normal: Vec3) => void;
  #subscription: { cancel: () => void } | null = null;
  #timeout: ReturnType<typeof setTimeout> | null = null;

  constructor(onPlaceTag: (position: Vec3, normal: Vec3) => void) {
    this.#onPlaceTag = onPlaceTag;
  }

  setMpSdk(sdk: MpSdk) {
    this.#mpSdk = sdk;
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
    if (!this.#mpSdk) return;
    this.#subscription = this.#mpSdk.Pointer.intersection.subscribe(
      (data: { position: Vec3; normal: Vec3 }) => {
        if (data && data.position && data.normal) {
          this.lastIntersection = { position: data.position, normal: data.normal };
        }
      },
    );
  }

  #stop() {
    if (this.#subscription) {
      this.#subscription.cancel();
      this.#subscription = null;
    }
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
