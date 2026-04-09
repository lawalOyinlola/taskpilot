<script setup>
import { ref } from "vue";
import {
  PhListChecks,
  PhShareNetwork,
  PhCheckCircle,
  PhCamera,
} from "@phosphor-icons/vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TaskItem from "./TaskItem.vue";

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  filteredTasks: { type: Array, default: () => [] },
  currentCategory: { type: String, default: "all" },
  currentFilter: { type: String, default: "all" },
  categories: { type: Array, default: () => [] },
  isSharing: { type: Boolean, default: false },
  getCategoryIcon: { type: Function, required: true },
});

const FILTER_OPTIONS = ["all", "active", "completed", "expired"];

const emit = defineEmits([
  "update:currentCategory",
  "update:currentFilter",
  "toggle-status",
  "delete-task",
  "save-edit",
  "start-editing",
  "cancel-edit",
  "share",
  "screenshot",
  "clear-all",
]);

const taskListRef = ref(null);

defineExpose({
  taskListRef,
});
</script>

<template>
  <Card
    class="bg-surface-container-low dark:bg-surface-container-high/80 border border-border/50 shadow-sm overflow-hidden min-h-[400px] flex flex-col"
  >
    <div
      ref="taskListRef"
      id="task-pilot-capture-target"
      class="flex flex-col grow"
    >
      <CardHeader
        class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6"
      >
        <CardTitle class="text-xl font-headings font-extrabold tracking-tight">
          Mission Feed:
          <span class="text-primary ml-1">{{ currentCategory }}</span>
        </CardTitle>

        <div
          class="hidden sm:flex gap-0.5 bg-surface-container-highest/50 rounded-xl p-1 shadow-sm shadow-primary/20"
        >
          <Button
            v-for="filter in FILTER_OPTIONS"
            :key="filter"
            variant="ghost"
            size="sm"
            @click="emit('update:currentFilter', filter)"
            :class="
              cn(
                'h-7.5 px-2.5 text-[10px] font-headings font-black uppercase tracking-widest transition-all duration-300',
                currentFilter === filter
                  ? 'bg-primary text-primary-foreground rounded-lg'
                  : 'text-muted-foreground/60 hover:text-foreground hover:bg-primary/20',
              )
            "
          >
            {{ filter === "completed" ? "Done" : filter }}
          </Button>
        </div>

        <div class="sm:hidden flex flex-row items-center gap-2 w-full">
          <Select
            :model-value="currentCategory"
            @update:model-value="emit('update:currentCategory', $event)"
          >
            <SelectTrigger
              class="h-9 bg-surface-container-highest/50 border-outline-variant/10 text-[10px] font-black uppercase tracking-widest"
            >
              <SelectValue :placeholder="currentCategory" />
            </SelectTrigger>
            <SelectContent
              class="bg-surface-container-highest border-outline-variant/10"
            >
              <SelectItem
                v-for="cat in categories"
                :key="cat.name"
                :value="cat.name"
              >
                {{ cat.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            :model-value="currentFilter"
            @update:model-value="emit('update:currentFilter', $event)"
          >
            <SelectTrigger
              class="h-9 bg-surface-container-highest/50 border-outline-variant/10 text-[10px] font-black uppercase tracking-widest"
            >
              <SelectValue :placeholder="currentFilter" />
            </SelectTrigger>
            <SelectContent
              class="bg-surface-container-highest border-outline-variant/10"
            >
              <SelectItem v-for="f in FILTER_OPTIONS" :key="f" :value="f">
                {{ f.toUpperCase() }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent class="p-6 pt-0 mb-auto grow">
        <div
          v-if="filteredTasks.length === 0"
          class="flex flex-col items-center justify-center py-16 opacity-20 select-none"
        >
          <ph-list-checks :size="32" class="mb-4" />
          <p class="text-base font-headings font-bold">
            RADAR CLEAR: NO TARGETS DETECTED
          </p>
        </div>

        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :get-category-icon="getCategoryIcon"
          @toggle-status="emit('toggle-status', $event)"
          @delete-task="emit('delete-task', $event)"
          @save-edit="emit('save-edit', $event)"
          @start-editing="emit('start-editing', $event)"
          @cancel-edit="emit('cancel-edit', $event)"
        />
      </CardContent>

      <CardFooter
        class="flex items-center justify-between p-6 pt-4 mt-auto border-t border-border/5"
      >
        <!-- DESKTOP BUTTONS -->
        <div class="hidden sm:flex items-center gap-2">
          <Button
            @click="emit('share')"
            class="font-black text-[10px] uppercase tracking-wider h-9 px-5 active:scale-95 shadow-lg shadow-primary/10 transition-all"
          >
            <template v-if="isSharing" class="">
              <ph-check-circle :size="18" weight="bold" />
              Copied!
            </template>
            <template v-else>
              <ph-share-network :size="18" weight="bold" />

              Share Task{{ filteredTasks.length > 1 ? "s" : "" }}
            </template>
          </Button>
          <Button
            variant="outline"
            @click="emit('screenshot')"
            class="h-9.5 px-5 text-muted-foreground/60 hover:text-foreground hover:bg-surface-container-highest active:scale-95 transition-all font-black text-[10px] uppercase tracking-wider"
          >
            <ph-camera :size="18" weight="bold" />
            Screenshot
          </Button>
        </div>

        <!-- MOBILE BUTTONS -->
        <div class="flex sm:hidden gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                @click="emit('share')"
                aria-label="Share tasks"
                class="font-black uppercase tracking-wider h-9 px-5 active:scale-95 shadow-lg shadow-primary/10 transition-all"
              >
                <ph-share-network :size="18" weight="bold" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              class="bg-primary text-primary-foreground border-none font-bold text-xs"
            >
              Share Task{{ filteredTasks.length > 1 ? "s" : "" }}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                @click="emit('screenshot')"
                aria-label="Take screenshot"
                class="h-9 px-5 text-muted-foreground/60 hover:text-foreground hover:bg-surface-container-highest active:scale-95 transition-all font-black text-[10px] uppercase tracking-wider"
              >
                <ph-camera :size="18" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              class="bg-primary text-primary-foreground border-none font-bold text-xs"
            >
              Screenshot
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          variant="ghost"
          @click="emit('clear-all')"
          class="h-9 px-4 rounded-lg text-destructive font-headings font-black text-[10px] uppercase tracking-widest hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
        >
          Clear All
        </Button>
      </CardFooter>
    </div>
  </Card>
</template>
