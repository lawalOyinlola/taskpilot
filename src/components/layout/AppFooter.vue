<script setup>
import { PhHeart } from "@phosphor-icons/vue";

defineProps({
  // No props needed currently
});
</script>

<template>
  <footer
    class="mt-16 mb-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
  >
    <div class="h-0.5 max-w-200 w-full bg-border/60 mb-8"></div>

    <p class="group flex flex-col items-center gap-3">
      <span
        class="text-[11px] font-headings font-bold text-muted-foreground/80 uppercase tracking-[0.3em] transition-colors group-hover:text-muted-foreground/50"
      >
        Crafted with Excellence
      </span>

      <a
        href="https://lawaloyinlola.com"
        target="_blank"
        rel="noopener noreferrer"
        class="relative flex items-center gap-3 px-6 py-2.5 rounded-full bg-surface-container-high/40 border border-border/40 hover:border-primary/40 hover:bg-surface-container-highest transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 active:scale-95 group/link"
      >
        <ph-heart
          :size="14"
          weight="fill"
          class="text-destructive/40 group-hover/link:text-destructive group-hover/link:scale-110 transition-all duration-500"
        />

        <span
          class="text-xs font-headings font-black tracking-widest text-muted-foreground/70 group-hover/link:text-foreground transition-colors uppercase"
        >
          LAWAL
        </span>

        <div
          class="h-1 w-1 rounded-full bg-primary/40 group-hover/link:bg-primary transition-colors"
        ></div>
      </a>
    </p>

    <div
      class="mt-8 text-[9px] font-medium text-muted-foreground/40 uppercase tracking-[0.4em] pointer-events-none"
    >
      Est. 2023 • TaskPilot Engine
    </div>
  </footer>
</template>
