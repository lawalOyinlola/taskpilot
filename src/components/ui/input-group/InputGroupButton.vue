<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { type InputGroupButtonVariants, inputGroupButtonVariants } from './index'

interface InputGroupButtonProps {
  variant?: 'ghost' | 'secondary' | 'outline' | 'default' | 'destructive' | 'link'
  size?: InputGroupButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = defineProps<InputGroupButtonProps>()

const classes = computed(() => {
  return cn(
    inputGroupButtonVariants({ size: props.size }),
    props.class,
  )
})
</script>

<template>
  <Button
    :variant="variant"
    :size="size?.startsWith('icon') ? 'icon' : 'sm'"
    :class="classes"
  >
    <slot />
  </Button>
</template>
