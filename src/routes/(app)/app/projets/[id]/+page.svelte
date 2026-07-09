<script lang="ts">
  import { onMount } from "svelte";
  import type { PageData, ActionData } from "./$types";
  import type { MpSdk } from "@matterport/sdk";
  import tagAmianteImg from "$lib/assets/tagamiante.png";
  import tagPlombImg from "$lib/assets/tagplomb.png";
  import tagTermiteImg from "$lib/assets/tagtermite.png";
  import tagPemdImg from "$lib/assets/pemd360.png";
  import { Mail, Plus, Pencil } from "lucide-svelte";
  import { invalidateAll } from "$app/navigation";
  import PresenceFilterModal from "$lib/components/PresenceFilterModal.svelte";
  import PemdCreateModal from "$lib/components/PemdCreateModal.svelte";
  import PemdFilterModal from "$lib/components/PemdFilterModal.svelte";
  import { PemdEditMode } from "$lib/pemd-edit-mode.svelte";
  import { /* @vite-ignore */ connect as MatterportSDK_script } from "$lib/sdk.es6.js";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let iframe: HTMLIFrameElement;

  let SDK_choice = $state("NPM");

  let MatterportSDK: MpSdk | undefined = $state();

  let showMail = $state(false);
  let showAmiante = $state(false);
  let showPlomb = $state(false);
  let showTermite = $state(false);
  let showPemd = $state(false);

  let showAmianteModal = $state(false);
  let showPlombModal = $state(false);
  let showTermiteModal = $state(false);
  let showPemdModal = $state(false);

  let showPemdCreateModal = $state(false);
  let pendingTagPosition: {
    anchorPosition: { x: number; y: number; z: number };
    normal: { x: number; y: number; z: number };
  } | null = $state(null);
  const editMode = new PemdEditMode((position, normal) => openPemdCreateModal(position, normal));
  let amiantePresenceSelected: number[] = [0, 1, 2];
  let plombPresenceSelected: number[] = [0, 1, 2];
  let termitePresenceSelected: number[] = [0, 1, 2];

  let mailSids: string[] = [];
  let amianteSids: string[] = [];
  let plombSids: string[] = [];
  let termiteSids: string[] = [];
  let pemdSids = $state([] as string[]);

  // Generic helper shared by toggleAmiante, togglePlomb, toggleTermite.
  // Always removes the current SIDs first, then adds filtered tags if `show` is true.
  // Returns the new SIDs array so callers can reassign their variable.
  interface PresenceTag {
    id: unknown;
    anchorPosition: string;
    stemVector: string;
  }

  async function togglePresenceTags<T extends PresenceTag>(
    show: boolean,
    currentSids: string[],
    tags: T[] | undefined,
    presenceSelected: number[],
    getPresence: (tag: T) => number,
    buildLabel: (tag: T) => string,
    buildDescription: (tag: T) => string,
    getColor: (tag: T) => { r: number; g: number; b: number },
    typeName: string,
  ): Promise<string[]> {
    if (!MatterportSDK) return currentSids;

    for (const sid of currentSids) {
      try {
        await MatterportSDK.Tag.remove(sid);
      } catch (e) {
        console.error(`Failed to remove ${typeName} sid`, sid, e);
      }
    }

    if (!show || !tags || tags.length === 0) return [];

    const newSids: string[] = [];
    const filtered = tags.filter((tag) => presenceSelected.includes(getPresence(tag)));
    console.log(`Adding ${filtered.length} ${typeName} tags`);

    for (const tag of filtered) {
      try {
        const anchorPosition = JSON.parse(tag.anchorPosition);
        const stemVector = JSON.parse(tag.stemVector);
        const [sid] = await MatterportSDK.Tag.add({
          label: buildLabel(tag),
          description: buildDescription(tag),
          anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
          stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
          color: getColor(tag),
        });
        newSids.push(sid);
      } catch (tagError) {
        console.error(`Failed to add ${typeName} tag ${tag.id}:`, tagError);
      }
    }

    return newSids;
  }

  async function toggleMail() {
    if (!MatterportSDK) return;
    if (showMail) {
      if (data.tags && data.tags.length > 0) {
        console.log(`Adding ${data.tags.length} tags to the model`);
        for (const tag of data.tags) {
          try {
            const anchorPosition = JSON.parse(tag.anchorPosition);
            const stemVector = JSON.parse(tag.stemVector);
            const tagDate = tag.date ? new Date(tag.date).toLocaleDateString() : "";
            const tagDescriptor = {
              label: `Mail - ${tagDate}`,
              description: tag.content,
              anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
              stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
            };
            const [sid] = await MatterportSDK.Tag.add(tagDescriptor);
            mailSids.push(sid);
          } catch (tagError) {
            console.error(`Failed to add tag ${tag.id}:`, tagError);
          }
        }
      }
    } else {
      for (const sid of mailSids) {
        try {
          await MatterportSDK.Tag.remove(sid);
        } catch (e) {
          console.error(e);
        }
      }
      mailSids = [];
    }
  }

  async function toggleAmiante() {
    amianteSids = await togglePresenceTags(
      showAmiante,
      amianteSids,
      data.amianteTags,
      amiantePresenceSelected,
      (tag: App.TagsAmiante) => Number(tag.presenceAmiante),
      (tag) => `Amiante - ${tag.presenceAmiante ? "Présence" : "Absence"}`,
      (tag) => `${tag.description}\nType: ${tag.type}\nÉtage: ${tag.etage}`,
      (tag) => (tag.presenceAmiante ? { r: 1, g: 0, b: 0 } : { r: 0, g: 1, b: 0 }),
      "amiante",
    );
  }

  async function togglePlomb() {
    plombSids = await togglePresenceTags(
      showPlomb,
      plombSids,
      data.plombTags,
      plombPresenceSelected,
      (tag: App.PlombTags) => Number(tag.presencePlomb),
      (tag) => `Plomb - ${tag.presencePlomb ? "Présence" : "Absence"}`,
      (tag) => {
        let desc = tag.description;
        if (tag.presencePlomb && tag.concentration) desc += `\nConcentration: ${tag.concentration}`;
        desc += `\nÉtage: ${tag.etage}`;
        return desc;
      },
      (tag) => (tag.presencePlomb ? { r: 1, g: 0.5, b: 0 } : { r: 0, g: 0.7, b: 1 }),
      "plomb",
    );
  }

  async function toggleTermite() {
    termiteSids = await togglePresenceTags(
      showTermite,
      termiteSids,
      data.termiteTags,
      termitePresenceSelected,
      (tag: App.TermiteTags) => Number(tag.presenceTermite),
      (tag) => `Termite - ${tag.presenceTermite ? "Présence" : "Absence"}`,
      (tag) => `${tag.description}\nÉtage: ${tag.etage}`,
      (tag) => (tag.presenceTermite ? { r: 0.6, g: 0.3, b: 0 } : { r: 0.5, g: 1, b: 0.5 }),
      "termite",
    );
  }

  async function addFilteredPemdTags(allowedIds: number[]) {
    if (!MatterportSDK) return;
    if (!data.pemdTags || data.pemdTags.length === 0) return;
    // remove existing PEMD tags before adding the new filtered set
    await removePemdTags();
    const filtered = data.pemdTags.filter(
      (pemdTag: App.Pemds) =>
        pemdTag.objetId != null && allowedIds.includes(Number(pemdTag.objetId)),
    );
    console.log(`Adding ${filtered.length} pemd tags (filtered)`);
    for (const tag of filtered) {
      try {
        if (!tag.anchorPosition || !tag.stemVector) continue;
        const anchorPosition = JSON.parse(tag.anchorPosition);
        const stemVector = JSON.parse(tag.stemVector);
        let description = tag.description || "";
        if (tag.quantite) description += `\nQuantité: ${tag.quantite}`;
        if (tag.etage) description += `\nÉtage: ${tag.etage}`;
        if (tag.etat) description += `\nÉtat: ${tag.etat}`;

        const tagDescriptor = {
          label: "PEMD",
          description: description,
          anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
          stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
          color: { r: 0.6, g: 0.2, b: 0.8 },
        };
        const [sid] = await MatterportSDK.Tag.add(tagDescriptor);
        pemdSids.push(sid);
      } catch (tagError) {
        console.error(`Failed to add pemd tag ${tag.id}:`, tagError);
      }
    }
    // keep the UI toggle state true (user wants to display PEMD tags)
    showPemd = true;
    showPemdModal = false;
  }

  async function removePemdTags() {
    if (!MatterportSDK) return;
    for (const sid of pemdSids) {
      try {
        await MatterportSDK.Tag.remove(sid);
      } catch (e) {
        console.error("Failed to remove pemd sid", sid, e);
      }
    }
    pemdSids = [];
    showPemd = false;
  }

  function openPemdCreateModal(
    position: { x: number; y: number; z: number },
    normal: { x: number; y: number; z: number },
  ) {
    // Calculate stemVector from normal (pointing outward from surface)
    const stemVector = {
      x: normal.x * 0.15,
      y: normal.y * 0.15,
      z: normal.z * 0.15,
    };

    pendingTagPosition = {
      anchorPosition: position,
      normal: stemVector,
    };

    showPemdCreateModal = true;
  }

  function closePemdCreateModal() {
    showPemdCreateModal = false;
    pendingTagPosition = null;
  }

  async function addNewPemdTagToModel(tagData: App.Tag): Promise<App.TagResponse | void> {
    if (!MatterportSDK) return;

    try {
      const anchorPosition = JSON.parse(tagData.anchorPosition);
      const stemVector = JSON.parse(tagData.stemVector);

      let description = tagData.description || "";
      if (tagData.quantite) description += `\nQuantité: ${tagData.quantite}`;
      if (tagData.etage) description += `\nÉtage: ${tagData.etage}`;
      if (tagData.etat) description += `\nÉtat: ${tagData.etat}`;

      const tagDescriptor = {
        label: "PEMD",
        description: description,
        anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
        stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
        color: { r: 0.6, g: 0.2, b: 0.8 },
      };

      const [sid] = await MatterportSDK.Tag.add(tagDescriptor);
      pemdSids.push(sid);
      showPemd = true;
    } catch (e) {
      console.error("Failed to add new PEMD tag to model:", e);
    }
  }

  async function connectSdk(choice: string) {
    if (choice === "NPM") {
      const { setupSdk } = await import("@matterport/sdk");
      MatterportSDK = await setupSdk(data.matterportSdkKey, { iframe });
    } else {
      MatterportSDK = (await MatterportSDK_script(iframe, {
        applicationKey: data.matterportSdkKey,
      })) as unknown as MpSdk;
    }
    editMode.setMpSdk(MatterportSDK);
    console.log("Matterport SDK connected via", choice, MatterportSDK);
  }

  function disconnectSdk() {
    try {
      if (MatterportSDK && MatterportSDK.disconnect) MatterportSDK.disconnect();
    } catch (err) {
      console.error("Matterport SDK disconnect failed:", err);
    }
    MatterportSDK = undefined;
  }

  function reloadIframe() {
    if (iframe) {
      iframe.src = iframe.src;
    }
  }

  let mounted = false;

  onMount(() => {
    let handleUnhandledRejection: (ev: PromiseRejectionEvent) => void;
    (async () => {
      try {
        await connectSdk(SDK_choice);

        // Suppress noisy analytics/network errors coming from the Matterport SDK (often caused by ad-blockers)
        handleUnhandledRejection = (ev: PromiseRejectionEvent) => {
          try {
            const reason: PromiseRejectionEvent["reason"] = ev.reason;
            const msg =
              typeof reason === "string"
                ? reason
                : reason &&
                  (reason.message || (reason.error && reason.error.message) || reason.url || "");
            if (msg && String(msg).includes("events.matterport.com")) {
              ev.preventDefault();
              console.debug("Ignored blocked Matterport analytics request:", reason);
            }
          } catch (ignored) {
            console.debug("Unhandled rejection handler failed:", ignored);
          }
        };
        window.addEventListener("unhandledrejection", handleUnhandledRejection);
        mounted = true;
      } catch (e) {
        console.error("Matterport SDK connection failed:", e);
      }
    })();

    return () => {
      mounted = false;
      if (handleUnhandledRejection)
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      editMode.cleanup();
      disconnectSdk();
    };
  });

  // Reconnect when SDK_choice changes after initial mount
  $effect(() => {
    const choice = SDK_choice;
    if (!mounted) return;

    // Run async reconnection
    (async () => {
      disconnectSdk();
      reloadIframe();
      // Wait for iframe to reload before reconnecting
      await new Promise<void>((resolve) => {
        iframe.addEventListener("load", () => resolve(), { once: true });
      });
      try {
        await connectSdk(choice);
      } catch (e) {
        console.error("Matterport SDK reconnection failed:", e);
      }
    })();
  });

  // Effect to handle form submission result
  $effect(() => {
    if (form?.success && form?.tag) {
      // Add the new tag to the model
      addNewPemdTagToModel(form.tag);
      closePemdCreateModal();
      // Refresh the data
      invalidateAll();
    }
  });
</script>

<div class="flex h-screen w-full flex-col p-6">
  <PresenceFilterModal
    title="Filtrer Amiante"
    bind:show={showAmianteModal}
    onApply={(selected) => {
      amiantePresenceSelected = selected;
      showAmiante = true;
      toggleAmiante();
    }}
  />

  <PemdFilterModal
    bind:show={showPemdModal}
    groups={data.groups || []}
    categoriesV2={data.categoriesV2 || []}
    allPemdObjects={data.allPemdObjects || []}
    hasTags={pemdSids.length > 0}
    onApply={addFilteredPemdTags}
    onRemove={removePemdTags}
  />

  <PresenceFilterModal
    title="Filtrer Plomb"
    bind:show={showPlombModal}
    onApply={(selected) => {
      plombPresenceSelected = selected;
      showPlomb = true;
      togglePlomb();
    }}
  />

  <PresenceFilterModal
    title="Filtrer Termite"
    bind:show={showTermiteModal}
    onApply={(selected) => {
      termitePresenceSelected = selected;
      showTermite = true;
      toggleTermite();
    }}
  />

  <PemdCreateModal
    show={showPemdCreateModal}
    pendingPosition={pendingTagPosition}
    groups={data.groups || []}
    categoriesV2={data.categoriesV2 || []}
    allPemdObjects={data.allPemdObjects || []}
    onClose={closePemdCreateModal}
  />

  <div class="join mb-6 grid w-full grid-cols-7">
    <button
      type="button"
      title="Afficher les mail tags"
      aria-pressed={showMail}
      onclick={() => {
        showMail = !showMail;
        toggleMail();
      }}
      class={`btn join-item ${showMail ? "bg-gray-500" : ""}`}
    >
      <Mail size={32} class={`transition-transform ${showMail ? "text-blue-700" : ""}`} />
    </button>

    <button
      type="button"
      title="Afficher les tags amiante"
      aria-pressed={showAmiante}
      onclick={() => {
        if (showAmiante) {
          showAmiante = false;
          toggleAmiante();
        } else {
          showAmianteModal = true;
        }
      }}
      class={`btn join-item ${showAmiante ? "bg-gray-500" : ""}`}
    >
      <img
        src={tagAmianteImg}
        alt="amiante"
        class={`h-10 w-10 transition-transform ${showAmiante ? "scale-110" : ""}`}
      />
    </button>

    <button
      type="button"
      title="Afficher les tags plomb"
      aria-pressed={showPlomb}
      onclick={() => {
        if (showPlomb) {
          showPlomb = false;
          togglePlomb();
        } else {
          showPlombModal = true;
        }
      }}
      class={`btn join-item ${showPlomb ? "bg-gray-500" : ""}`}
    >
      <img
        src={tagPlombImg}
        alt="plomb"
        class={`h-10 w-10 transition-transform ${showPlomb ? "scale-110" : ""}`}
      />
    </button>

    <button
      type="button"
      title="Afficher les tags termite"
      aria-pressed={showTermite}
      onclick={() => {
        if (showTermite) {
          showTermite = false;
          toggleTermite();
        } else {
          showTermiteModal = true;
        }
      }}
      class={`btn join-item ${showTermite ? "bg-gray-500" : ""}`}
    >
      <img
        src={tagTermiteImg}
        alt="termite"
        class={`h-10 w-10 transition-transform ${showTermite ? "scale-110" : ""}`}
      />
    </button>

    <button
      type="button"
      title="Afficher les tags PEMD"
      aria-pressed={showPemd}
      onclick={() => {
        showPemdModal = true;
      }}
      class={`btn join-item ${showPemd ? "bg-gray-500" : ""}`}
    >
      <img
        src={tagPemdImg}
        alt="pemd"
        class={`h-24 w-24 object-contain transition-transform ${showPemd ? "scale-140" : ""}`}
      />
    </button>

    <button
      type="button"
      title={editMode.enabled ? "Désactiver le mode édition PEMD" : "Activer le mode édition PEMD"}
      aria-pressed={editMode.enabled}
      onclick={() => editMode.toggle()}
      class="btn"
    >
      <Pencil size={20} />
      Édition
    </button>

    <select bind:value={SDK_choice} class="select join-item appearance-none">
      <option selected>NPM</option>
      <option>Script</option>
    </select>
  </div>

  <div class="relative flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
    <iframe
      bind:this={iframe}
      title="Matterport Showcase"
      class="h-full w-full"
      src="https://my.matterport.com/show?m={data.projet
        .id}&play=1&applicationKey={data.matterportSdkKey}"
      frameborder="0"
      allow="fullscreen; vr"
    >
    </iframe>

    <!-- Overlay for capturing clicks in edit mode -->
    {#if editMode.enabled}
      <div
        bind:this={editMode.overlay}
        role="button"
        tabindex="0"
        aria-label="Cliquez pour ajouter un tag PEMD"
        class="absolute inset-0 z-10 cursor-crosshair"
        style="background: rgba(147, 51, 234, 0.05);"
        onclick={(e) => editMode.handleOverlayClick(e)}
        onmousemove={(e) => editMode.handleOverlayMouseMove(e)}
        onkeydown={(e) => editMode.handleOverlayKeydown(e)}
      >
        <!-- Visual indicator showing where the tag will be placed -->
        {#if editMode.lastIntersection}
          <div
            class="absolute bottom-4 left-4 rounded-lg border border-purple-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm"
          >
            <div class="flex items-center gap-2 text-purple-700">
              <Plus size={16} />
              <span class="text-sm font-medium">Cliquez pour placer le tag</span>
            </div>
            <div class="mt-1 text-xs">
              Position: X={editMode.lastIntersection!.position.x.toFixed(2)}, Y={editMode.lastIntersection!.position.y.toFixed(
                2,
              )}, Z={editMode.lastIntersection!.position.z.toFixed(2)}
            </div>
          </div>
        {:else}
          <div
            class="absolute bottom-4 left-4 rounded-lg border border-gray-200 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm">Déplacez le curseur sur le modèle...</span>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
