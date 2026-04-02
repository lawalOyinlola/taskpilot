<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

interface InputGroupInputProps {
  modelValue?: string | number
  class?: HTMLAttributes['class']
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}

const props = defineProps<InputGroupInputProps>()
const emit = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emit)

const classes = computed(() => {
  return cn(
    'flex h-10 w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden',
    props.class,
  )
})
</script>

<template>
  <input
    v-model="modelValue"
    :type="type || 'text'"
    :class="classes"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    class="focus:ring-0 focus-visible:ring-0 focus:outline-none"
  >
</template>
