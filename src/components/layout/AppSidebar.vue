<script setup>
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

defineProps({
  categories: Array,
  currentCategory: String,
  stats: Object,
});

defineEmits(["update:currentCategory"]);
</script>

<template>
  <aside class="space-y-6 order-last lg:order-first">
    <!-- CATEGORY CARD -->
    <Card
      class="hidden sm:block bg-surface-container-low border border-border/50 shadow-sm overflow-hidden"
    >
      <CardHeader class="pb-2">
        <CardTitle
          class="text-[10px] font-headings font-black uppercase tracking-[0.2em] text-primary/60"
          >Operational Sectors</CardTitle
        >
      </CardHeader>
      <CardContent class="p-2 space-y-1">
        <button
          v-for="cat in categories"
          :key="cat.name"
          type="button"
          @click="$emit('update:currentCategory', cat.name)"
          :aria-pressed="currentCategory === cat.name"
          :class="
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group relative z-10 w-full',
              currentCategory === cat.name
                ? 'bg-primary/10 text-primary shadow-inner border border-primary/20'
                : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground',
            )
          "
        >
          <component :is="cat.icon" :size="18" />
          <span class="font-bold text-sm tracking-tight">{{ cat.name }}</span>
          <span
            v-if="currentCategory === cat.name"
            class="absolute left-0 w-1 h-4 bg-primary rounded-r-full"
          />
        </button>
      </CardContent>
    </Card>

    <!-- MISSION PROGRESS CARD -->
    <Card class="bg-surface-container-low border border-border/50 shadow-sm">
      <CardHeader class="pb-2">
        <CardTitle
          class="text-[10px] text-center font-headings font-black uppercase tracking-[0.2em] text-primary/60"
          >Mission Progress</CardTitle
        >
      </CardHeader>
      <CardContent class="text-center p-6 pt-2 relative z-10">
        <div class="text-4xl font-headings font-black text-primary mb-1">
          {{ stats.percentage }}%
        </div>
        <div
          class="text-[10px] text-muted-foreground mb-4 font-headings font-black uppercase tracking-widest opacity-60"
        >
          Completed: {{ stats.completed }} / {{ stats.total }}
        </div>
        <Progress
          :model-value="stats.percentage"
          class="h-1.5 bg-surface-container-high"
        />
      </CardContent>
    </Card>
  </aside>
</template>
