<script setup>
import { format, parseISO } from "date-fns";
import { 
  PhClock, 
  PhCheckCircle, 
  PhX, 
  PhPencilSimpleLine, 
  PhTrash 
} from "@phosphor-icons/vue";
import { cn } from "@/lib/utils";
import { isTaskExpired } from "@/lib/task-utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";

const props = defineProps({
  task: Object,
  getCategoryIcon: Function,
});

const emit = defineEmits([
  "toggle-status",
  "delete-task",
  "save-edit",
  "start-editing",
  "cancel-edit",
]);

// Directive for focus
const vFocus = {
  mounted: (el) => el.focus(),
};
</script>

<template>
  <Item
    :class="
      cn(
        'group p-3 sm:p-4 transition-all duration-300 border-none rounded-xl mb-2 flex items-start gap-2 sm:gap-4',
        task.isCompleted
          ? 'opacity-60 bg-surface-container-low'
          : 'bg-surface-container-highest/60 shadow-sm hover:bg-surface-container-highest/80',
      )
    "
  >
    <ItemMedia class="pl-1 shrink-0 pt-1">
      <Checkbox
        :model-value="task.isCompleted"
        @update:model-value="emit('toggle-status', task)"
        class="w-5 h-5 border-2 border-primary/20 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
      />
    </ItemMedia>

    <ItemContent class="flex-1 min-w-0 overflow-hidden">
      <div class="flex flex-col gap-1">
        <div class="flex items-start justify-between gap-2">
          <div class="grow min-w-0">
            <Textarea
              v-if="task.isEditing"
              v-focus
              v-model="task.name"
              @blur="emit('save-edit', task)"
              @keyup.enter="emit('save-edit', task)"
              @keyup.esc="emit('cancel-edit', task)"
              class="w-full min-h-10 text-base font-headings font-bold py-1 px-3 bg-surface-container/50 border border-primary/30 rounded-lg focus:ring-1 focus:ring-primary/50 resize-none no-scrollbar"
            />
            <ItemTitle
              v-else
              :class="
                cn(
                  'text-base font-headings font-bold transition-all duration-300 text-foreground whitespace-pre-wrap break-all leading-tight',
                  task.isCompleted &&
                    'line-through text-muted-foreground opacity-50',
                )
              "
            >
              {{ task.name }}
            </ItemTitle>
          </div>

          <div class="flex gap-1 shrink-0 pt-0.5">
            <span
              v-if="isTaskExpired(task)"
              class="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground animate-pulse"
            >
              Expired
            </span>
            <span
              v-else-if="task.isCompleted"
              class="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-primary text-primary-foreground"
            >
              Done
            </span>
          </div>
        </div>

        <ItemDescription
          class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-1"
        >
          <span
            :class="
              cn(
                'text-[9px] font-headings font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0',
                task.priority === 'high'
                  ? 'text-destructive bg-destructive/10 border-destructive/20'
                  : task.priority === 'med'
                    ? 'text-tertiary bg-tertiary/10 border-tertiary/20'
                    : 'text-primary bg-primary/10 border-primary/20',
              )
            "
          >
            {{
              task.priority === "med"
                ? "Standard"
                : task.priority === "high"
                  ? "Critical"
                  : "Low"
            }}
          </span>

          <span
            class="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-tight shrink-0"
          >
            <component
              :is="getCategoryIcon(task.category)"
              :size="12"
            />
            {{ task.category }}
          </span>

          <span
            v-if="task.dueDate"
            :class="
              cn(
                'flex items-center gap-1 text-[10px] font-semibold uppercase tracking-tight shrink-0',
                isTaskExpired(task)
                  ? 'text-destructive'
                  : 'text-primary/70',
              )
            "
          >
            <ph-clock :size="12" />
            {{ format(parseISO(task.dueDate), "MMM d") }}
          </span>
        </ItemDescription>
      </div>
    </ItemContent>

    <ItemActions
      class="flex flex-col sm:flex-row items-center gap-1 shrink-0"
    >
      <template v-if="task.isEditing">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Save changes"
          class="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg transition-all"
          @mousedown.prevent="emit('save-edit', task)"
        >
          <ph-check-circle :size="20" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cancel editing"
          class="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          @mousedown.prevent="emit('cancel-edit', task)"
        >
          <ph-x :size="20" />
        </Button>
      </template>
      <template v-else>
        <Button
          v-if="!task.isCompleted"
          variant="ghost"
          size="icon"
          aria-label="Edit mission"
          class="sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 sm:group-focus-within:opacity-100 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
          @click="emit('start-editing', task)"
        >
          <ph-pencil-simple-line :size="20" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete mission"
          class="sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 sm:group-focus-within:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
          @click="emit('delete-task', task)"
        >
          <ph-trash :size="20" />
        </Button>
      </template>
    </ItemActions>
  </Item>
</template>
