<script setup>
import { PhMagnifyingGlass, PhMoon, PhSun } from "@phosphor-icons/vue";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

defineProps({
  searchQuery: String,
  isDark: Boolean,
});

defineEmits(["update:searchQuery", "toggleDark"]);
</script>

<template>
  <header
    class="mb-12 relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8 max-sm:px-2.5"
  >
    <div class="flex flex-col mr-auto">
      <div class="flex items-center justify-start gap-4 mb-2">
        <div
          class="bg-primary p-3 rounded-xl font-headings font-extrabold text-2xl shadow-lg shadow-primary/20 transition-transform duration-500 hover:rotate-6 text-primary-foreground"
        >
          TP
        </div>
        <h1
          class="text-4xl md:text-5xl font-headings font-extrabold tracking-tighter text-foreground"
        >
          TASK PILOT
        </h1>
      </div>
      <p
        class="text-muted-foreground font-headings font-black uppercase tracking-[0.3em] text-[10px] opacity-60 text-center md:text-left"
      >
        Automated Productivity Navigation // V4.0
      </p>
    </div>

    <!-- Global Actions Container -->
    <div class="flex items-center gap-4 w-full md:w-auto">
      <!-- Global Search -->
      <div class="relative group w-full md:w-auto">
        <div
          class="absolute z-10 inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors"
        >
          <ph-magnifying-glass :size="18" />
        </div>

        <Input
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          placeholder="Search missions..."
          class="pl-12 h-11 w-full md:w-64 bg-surface-container-high border-outline-variant/40 focus-visible:ring-primary/30 rounded-2xl backdrop-blur-xl shadow-inner font-headings font-bold placeholder:text-muted-foreground/40! caret-primary transition-all duration-300 focus:md:w-80"
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        @click="$emit('toggleDark')"
        aria-label="Toggle dark mode"
        class="rounded-full h-11 w-11 border-outline-variant/20 bg-surface-container-highest backdrop-blur-sm hover:bg-surface-container-highest/70 transition-all duration-300 shadow-sm shadow-primary/20 shrink-0"
      >
        <ph-moon
          v-if="isDark"
          :size="20"
          class="text-primary"
          weight="fill"
        />
        <ph-sun v-else :size="20" class="text-accent" weight="fill" />
      </Button>
    </div>
  </header>
</template>
