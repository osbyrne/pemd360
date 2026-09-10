<script lang="ts">
  import { ui } from "$lib/styles/ui.stylex";
  import { ClipboardList, Recycle, Trash2 } from "lucide-svelte";
  import Tabs from "./Tabs.svelte";

  const tabs = [
    {
      href: "/app/admin/pemd-tableau",
      label: "Tableau PEMD",
      icon: ClipboardList,
      color: ui.textBlue600,
    },
    {
      href: "/app/admin/pemd-reemploi",
      label: "Tableau Réemploi",
      icon: Recycle,
      color: ui.textGreen600,
    },
    {
      href: "/app/admin/pemd-dechets",
      label: "Tableau Déchets",
      icon: Trash2,
      color: undefined,
    },
  ];
</script>

<Tabs {tabs} />
