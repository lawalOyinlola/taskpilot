<script setup lang="ts">
import { type HTMLAttributes, computed, onMounted, ref, watch } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

interface InputGroupTextareaProps {
  modelValue?: string | number
  class?: HTMLAttributes['class']
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
}

const props = defineProps<InputGroupTextareaProps>()
const emit = defineEmits(['update:modelValue'])

const modelValue = useVModel(props, 'modelValue', emit)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const adjustHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

onMounted(() => {
  adjustHeight()
})

watch(modelValue, () => {
  adjustHeight()
})

const classes = computed(() => {
  return cn(
    'flex min-h-12 w-full resize-none border-0 bg-transparent px-3 py-3 text-sm focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ring-0 focus-visible:ring-0 focus-visible:outline-none',
    props.class,
  )
})
</script>

<template>
  <textarea
    ref="textareaRef"
    v-model="modelValue"
    :class="classes"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    rows="1"
    @input="adjustHeight"
  />
</template>
