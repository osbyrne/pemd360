<script lang="ts">
  import { Mail, Phone, MapPin } from "lucide-svelte";
</script>

<footer>
  <div class="container mx-auto px-4 py-12">
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- Contact -->
      <div>
        <h5 class="mb-4 text-lg font-semibold">Contact</h5>
        <ul class="space-y-3 text-sm">
          <li>
            <a
              href="mailto:florent.mouriot@depollution-conseil.fr"
              class="flex items-center gap-3 transition-colors hover:text-emerald-500"
            >
              <Mail class="h-4 w-4 " />
              <span>florent.mouriot@depollution-conseil.fr</span>
            </a>
          </li>
          <li>
            <a
              href="tel:+33631326715"
              class="flex items-center gap-3 transition-colors hover:text-emerald-500"
            >
              <Phone class="h-4 w-4 " />
              <span>06 31 32 67 15</span>
            </a>
          </li>
          <li>
            <a
              href="https://maps.google.com/?q=7+rue+Montespan+91000+Évry-Courcouronnes"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-start gap-3 transition-colors hover:text-emerald-500"
            >
              <MapPin class="mt-0.5 h-4 w-4" />
              <span>7 rue Montespan 91000, Évry-Courcouronnes</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Liens utiles -->
      <div>
        <h5 class="mb-4 text-lg font-semibold">Liens utiles</h5>
        <ul class="space-y-2 text-sm">
          <li>
            <a href="/" class="transition-colors hover:text-emerald-500">Accueil</a>
          </li>
          <li>
            <a href="/about" class="transition-colors hover:text-emerald-500">À propos</a>
          </li>
          <li>
            <a href="/contact" class="transition-colors hover:text-emerald-500">Contact</a>
          </li>
          <li>
            <a href="/mentions" class="transition-colors hover:text-emerald-500">Mentions légales</a
            >
          </li>
        </ul>
      </div>

      <!-- Réseaux sociaux -->
      <div>
        <h5 class="mb-4 text-lg font-semibold">Réseaux sociaux</h5>
        <div class="flex items-center gap-4">
          <a
            href="https://fr.linkedin.com/company/depollution-conseil"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 transition-colors hover:text-emerald-500"
          >
            <span class="text-sm">LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Copyright -->
  <div class="border-t border-gray-800 py-4">
    <div class="container mx-auto px-4 text-center text-sm">
      © {new Date().getFullYear()} PEMD 360 - Dépollution Conseil. Tous droits réservés.
    </div>
  </div>
</footer>
