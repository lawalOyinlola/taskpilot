<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'
import { type InputGroupAddonVariants, inputGroupAddonVariants } from './index'

interface InputGroupAddonProps {
  align?: InputGroupAddonVariants['align']
  class?: HTMLAttributes['class']
}

const props = defineProps<InputGroupAddonProps>()

const classes = computed(() => {
  return cn(
    inputGroupAddonVariants({ align: props.align }),
    props.align === 'inline-start' && 'order-1',
    props.align === 'inline-end' && 'order-last',
    props.align === 'block-start' && 'order-1 border-b border-input',
    props.align === 'block-end' && 'order-last border-t border-input',
    props.class,
  )
})
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
