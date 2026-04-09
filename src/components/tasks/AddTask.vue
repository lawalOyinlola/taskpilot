<script setup>
import { ref, computed } from "vue";
import { format, parseISO } from "date-fns";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { PhTag, PhCalendarBlank, PhPaperPlaneRight } from "@phosphor-icons/vue";
import { ArrowDownUpIcon } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

const props = defineProps({
  categories: Array,
  priorities: Array,
});

const emit = defineEmits(["add-task"]);

const newTodoInput = ref("");
const newTodoPriority = ref(null);
const newTodoCategory = ref(null);
const newTodoDueDate = ref(null);
const calendarPlaceholder = ref(today(getLocalTimeZone()));

const newTodoDueDateValue = computed(() => {
  if (!newTodoDueDate.value) return null;
  const [year, month, day] = newTodoDueDate.value.split("-").map(Number);
  return new CalendarDate(year, month, day);
});

const handleDateUpdate = (val) => {
  if (val) {
    const d = new Date(val.year, val.month - 1, val.day);
    newTodoDueDate.value = format(d, "yyyy-MM-dd");
  } else {
    newTodoDueDate.value = null;
  }
};

const handleAddTask = () => {
  if (!newTodoInput.value.trim()) return;

  emit("add-task", {
    name: newTodoInput.value,
    priority: newTodoPriority.value,
    category: newTodoCategory.value,
    dueDate: newTodoDueDate.value,
  });

  // Reset local state
  newTodoInput.value = "";
  newTodoPriority.value = null;
  newTodoCategory.value = null;
  newTodoDueDate.value = null;
};
</script>

<template>
  <Card
    class="bg-surface-container-low border border-border/50 shadow-lg overflow-hidden group focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-500"
  >
    <CardContent class="p-6">
      <div class="space-y-4">
        <InputGroup
          class="bg-surface-container-highest/50 border border-outline-variant/10 focus-within:border-primary/20 transition-all duration-500 rounded-2xl shadow-inner"
        >
          <InputGroupTextarea
            v-model="newTodoInput"
            placeholder="What's the next mission?"
            class="text-base font-headings font-bold placeholder:text-muted-foreground/20 px-4 pt-4 pb-2.5 min-h-20 break-all"
          />

          <InputGroupAddon
            align="block-end"
            class="px-3 pb-3 pt-0 border-t-0 flex flex-wrap items-center justify-between gap-y-3"
          >
            <div class="flex items-center gap-1.5 flex-wrap">
              <div class="relative">
                <Label for="priority-select" class="sr-only"
                  >Priority Level</Label
                >
                <Select v-model="newTodoPriority">
                  <SelectTrigger
                    id="priority-select"
                    class="h-8 bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-container-highest/80 text-[10px] font-headings font-black uppercase tracking-wider px-3 rounded-lg gap-2 text-foreground transition-all"
                  >
                    <div
                      v-if="newTodoPriority"
                      :class="
                        cn(
                          'w-1.5 h-1.5 rounded-full shadow-sm',
                          newTodoPriority === 'high'
                            ? 'bg-destructive'
                            : newTodoPriority === 'med'
                              ? 'bg-tertiary'
                              : 'bg-primary',
                        )
                      "
                    />
                    <ArrowDownUpIcon
                      :size="12"
                      class="text-primary"
                      v-if="!newTodoPriority"
                    />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent
                    class="bg-surface-container-highest border-outline-variant/10 text-foreground rounded-xl backdrop-blur-xl"
                  >
                    <SelectItem
                      v-for="p in priorities"
                      :key="p.id"
                      :value="p.id"
                      class="text-xs font-headings font-bold uppercase"
                    >
                      {{ p.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Sector Selector -->
              <div class="relative">
                <Label for="sector-select" class="sr-only"
                  >Operational Sector</Label
                >
                <Select v-model="newTodoCategory">
                  <SelectTrigger
                    id="sector-select"
                    class="h-8 bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-container-highest/80 text-[10px] font-headings font-black uppercase tracking-wider px-3 rounded-lg gap-2 text-foreground transition-all"
                  >
                    <ph-tag :size="12" class="text-primary" />

                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent
                    class="bg-surface-container-highest border-outline-variant/10 text-foreground rounded-xl backdrop-blur-xl"
                  >
                    <SelectItem
                      v-for="c in categories.filter(
                        (cat) => cat.name !== 'All',
                      )"
                      :key="c.name"
                      :value="c.name"
                      class="text-xs font-bold"
                    >
                      {{ c.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Timeline Popover -->
              <div class="relative">
                <Label for="date-trigger" class="sr-only"
                  >Target Deadline</Label
                >
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      id="date-trigger"
                      variant="ghost"
                      class="h-8 bg-surface-container-highest border border-outline-variant/10 hover:bg-surface-container-highest/80 text-[10px] font-headings font-black uppercase tracking-wider px-3 rounded-lg gap-2 text-foreground blur-none hover:text-foreground"
                    >
                      <ph-calendar-blank :size="14" class="text-primary" />
                      {{
                        newTodoDueDate
                          ? format(parseISO(newTodoDueDate), "MMM d")
                          : "Deadline"
                      }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-0 bg-popover border-border shadow-2xl rounded-2xl overflow-hidden"
                    align="start"
                  >
                    <Calendar
                      class="bg-transparent border-none"
                      v-model:placeholder="calendarPlaceholder"
                      :model-value="newTodoDueDateValue"
                      :min-value="today(getLocalTimeZone())"
                      @update:model-value="handleDateUpdate"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <InputGroupButton
              @click="handleAddTask"
              :disabled="!newTodoInput.trim()"
              class="h-8! px-4! w-full sm:w-auto font-black text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-al"
            >
              Launch
              <ph-paper-plane-right weight="bold" class="size-3!" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <p
          class="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-1"
        >
          Protip: Consolidate objectives into clear, actionable task threads.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
