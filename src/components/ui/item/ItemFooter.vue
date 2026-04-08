<script setup>
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: [String, Object, Array],
    required: false,
    default: undefined,
  },
});
</script>

<template>
  <div
    data-slot="item-footer"
    :class="
      cn('flex basis-full items-center justify-between gap-2', props.class)
    "
  >
    <slot />
  </div>
</template>
