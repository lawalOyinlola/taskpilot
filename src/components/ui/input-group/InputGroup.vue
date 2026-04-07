<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface InputGroupProps {
  class?: HTMLAttributes['class']
  disabled?: boolean
  error?: boolean
}

const props = defineProps<InputGroupProps>()

const classes = computed(() => {
  return cn(
    'group/input-group ring-offset-background focus-within:ring-ring flex h-auto min-h-10 w-full flex-wrap items-center overflow-hidden rounded-md border border-input bg-background/50 backdrop-blur-sm transition-all focus-within:ring-2 focus-within:ring-offset-2',
    props.disabled && 'cursor-not-allowed opacity-50',
    props.error && 'border-destructive focus-within:ring-destructive',
    props.class,
  )
})
</script>

<template>
  <div
    :class="classes"
    :data-disabled="disabled"
  >
    <slot />
  </div>
</template>
