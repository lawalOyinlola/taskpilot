<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { format, addDays, isPast, endOfDay, parseISO, isToday } from "date-fns";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import {
  PhPencilSimpleLine,
  PhTrash,
  PhShareNetwork,
  PhCamera,
  PhListChecks,
  PhClock,
  PhCheckCircle,
  PhMoon,
  PhSun,
  PhX,
  PhMagnifyingGlass,
  PhSquaresFour,
  PhBriefcase,
  PhUser,
  PhRobot,
  PhHeartbeat,
  PhTag,
} from "@phosphor-icons/vue";
import autoAnimate from "@formkit/auto-animate";
import html2canvas from "html2canvas";
import LZString from "lz-string";
import { cn } from "@/lib/utils";
import { toast } from "vue-sonner";

// shadcn-vue components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { PhCalendarBlank, PhPaperPlaneRight } from "@phosphor-icons/vue";
import { ArrowDownUpIcon } from "lucide-vue-next";

// Directives
const vFocus = {
  mounted: (el) => el.focus(),
};

// References for DOM elements
const taskListRef = ref(null);
const newTodoInput = ref("");
const newTodoPriority = ref(null);
const newTodoCategory = ref(null);
const newTodoDueDate = ref(null);
const currentFilter = ref("all");
const currentCategory = ref("All");
const searchableTasks = computed(() => {
  return tasks.value.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

const calendarPlaceholder = ref(today(getLocalTimeZone()));

const newTodoDueDateValue = computed(() => {
  if (!newTodoDueDate.value) return null;
  const [year, month, day] = newTodoDueDate.value.split("-").map(Number);
  return new CalendarDate(year, month, day);
});

const searchQuery = ref("");
const isSharing = ref(false);
const lastDeletedTask = ref(null);
const lastDeletedIndex = ref(-1);

const truncate = (str, len = 50) =>
  str.length > len ? str.slice(0, len) + "..." : str;

// State
const tasks = ref([]);
const categories = [
  { name: "All", icon: PhSquaresFour },
  { name: "General", icon: PhTag },
  { name: "Work", icon: PhBriefcase },
  { name: "Personal", icon: PhUser },
  { name: "Automation", icon: PhRobot },
  { name: "Health", icon: PhHeartbeat },
];

const getCategoryIcon = (categoryName) => {
  const cat = categories.find((c) => c.name === categoryName);
  return cat ? cat.icon : PhTag;
};
const priorities = [
  { id: "high", label: "High", class: "priority-high" },
  { id: "med", label: "Medium", class: "priority-med" },
  { id: "low", label: "Low", class: "priority-low" },
];

// Computed
const filteredTasks = computed(() => {
  let result = [...tasks.value];

  if (currentCategory.value !== "All") {
    result = result.filter((t) => t.category === currentCategory.value);
  }

  if (currentFilter.value === "active") {
    result = result.filter((t) => !t.isCompleted && !isTaskExpired(t));
  } else if (currentFilter.value === "completed") {
    result = result.filter((t) => t.isCompleted);
  } else if (currentFilter.value === "expired") {
    result = result.filter((t) => isTaskExpired(t));
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((t) => t.name.toLowerCase().includes(q));
  }

  return result.sort((a, b) => {
    const pMap = { high: 0, med: 1, low: 2 };
    return pMap[a.priority] - pMap[b.priority];
  });
});

const stats = computed(() => {
  const active = tasks.value;
  const completed = active.filter((t) => t.isCompleted).length;
  const total = active.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
});

// Persistence
const saveTasks = () => {
  localStorage.setItem("taskpilot_tasks", JSON.stringify(tasks.value));
};

const loadTasks = () => {
  const saved = localStorage.getItem("taskpilot_tasks");
  if (saved) {
    const raw = JSON.parse(saved);
    tasks.value = raw.map((t) => ({
      ...t,
      isCompleted: t.isCompleted ?? false,
      priority: t.priority ?? "med",
      category: t.category ?? "General",
      dueDate: t.dueDate ?? new Date().toISOString().split("T")[0],
      isEditing: t.isEditing ?? false,
    }));
  } else {
    // Initial Tasks from User Request
    const now = new Date().toISOString().split("T")[0];
    tasks.value = [
      {
        id: Date.now() + 1,
        name: "Create an automation with openclaw",
        priority: "high",
        category: "Automation",
        dueDate: now,
        isCompleted: false,
        isEditing: false,
      },
      {
        id: Date.now() + 2,
        name: "Fix bug in n8n",
        priority: "high",
        category: "Automation",
        dueDate: now,
        isCompleted: false,
        isEditing: false,
      },
      {
        id: Date.now() + 3,
        name: "Exercise",
        priority: "med",
        category: "Health",
        dueDate: now,
        isCompleted: false,
        isEditing: false,
      },
      {
        id: Date.now() + 4,
        name: "Complete trackam backend setup",
        priority: "high",
        category: "Work",
        dueDate: now,
        isCompleted: false,
        isEditing: false,
      },
    ];
    saveTasks();
  }
};

// Actions
const startEditing = (task) => {
  task._originalName = task.name;
  task.isEditing = true;
};

const saveEdit = (task) => {
  if (!task.isEditing) return;
  task.isEditing = false;
  saveTasks();
  toast.success("Mission Updated", {
    description: `Directives for "${truncate(task.name)}" synchronized.`,
  });
};

const cancelEdit = (task) => {
  if (task._originalName) task.name = task._originalName;
  task.isEditing = false;
};

const addTask = () => {
  if (!newTodoInput.value.trim()) return;

  const defaultDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  tasks.value.unshift({
    id: Date.now(),
    name: newTodoInput.value,
    priority: newTodoPriority.value ?? "med",
    category:
      !newTodoCategory.value || newTodoCategory.value === "All"
        ? "General"
        : newTodoCategory.value,
    dueDate: newTodoDueDate.value ?? defaultDate,
    isCompleted: false,
    isEditing: false,
    createdAt: new Date().toISOString(),
  });

  toast.success("Mission Assigned", {
    description: "New objective prioritized in your queue.",
  });
  newTodoInput.value = "";
  // Reset selection states to null to show placeholders
  newTodoPriority.value = null;
  newTodoCategory.value = null;
  newTodoDueDate.value = null;
  saveTasks();
};

const toggleTodoStatus = (task) => {
  task.isCompleted = !task.isCompleted;
  saveTasks();
  if (task.isCompleted) {
    toast.success("Mission Accomplished", {
      description: `Objective "${truncate(task.name)}" secured.`,
    });
  } else {
    toast.info("Mission Resumed", {
      description: `Task "${truncate(task.name)}" is back on the radar.`,
    });
  }
};

const deleteTodo = (task) => {
  const index = tasks.value.findIndex((t) => t.id === task.id);
  if (index === -1) return;

  lastDeletedTask.value = { ...tasks.value[index] };
  lastDeletedIndex.value = index;

  tasks.value.splice(index, 1);
  saveTasks();

  toast.info("Mission Terminated", {
    description: `Target removed: ${truncate(task.name)}`,
    action: {
      label: "Undo",
      onClick: () => {
        if (lastDeletedTask.value) {
          tasks.value.splice(lastDeletedIndex.value, 0, lastDeletedTask.value);
          saveTasks();
          lastDeletedTask.value = null;
          lastDeletedIndex.value = -1;
          toast.success("Mission Restored");
        }
      },
    },
  });
};

const clearAll = () => {
  if (tasks.value.length === 0) return;

  toast.warning("Wipe entire interface?", {
    description: "This will permanently terminate all active missions.",
    action: {
      label: "Confirm",
      onClick: () => {
        tasks.value = [];
        saveTasks();
        toast.success("Interface Purged");
      },
    },
  });
};

const isTaskExpired = (task) => {
  if (!task.dueDate || task.isCompleted) return false;
  return (
    isPast(endOfDay(parseISO(task.dueDate))) && !isToday(parseISO(task.dueDate))
  );
};

const getTaskStatus = (task) => {
  if (task.isCompleted) return "Completed";
  if (isTaskExpired(task)) return "Expired";
  return "Active";
};

// Screenshot Logic
const captureScreenshot = async () => {
  if (!taskListRef.value) return;
  const toastId = toast.loading("Synthesizing Visual Log...");

  try {
    // Advanced capture configuration to handle complex CSS
    const canvas = await html2canvas(taskListRef.value, {
      backgroundColor: isDark.value ? "#0f172a" : "#f8fafc",
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      // The secret sauce: sanitize the DOM clone before rendering
      onclone: (clonedDoc) => {
        const clonedElement =
          clonedDoc.querySelector('[ref="taskListRef"]') ||
          clonedDoc.body.querySelector(".flex.flex-col.grow");

        if (clonedElement) {
          // Remove problematic backdrop filters and transitions
          const allElements = clonedElement.querySelectorAll("*");
          allElements.forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.backdropFilter !== "none") {
              el.style.backdropFilter = "none";
              el.style.webkitBackdropFilter = "none";
              // Fallback background for blurred elements
              el.style.backgroundColor = isDark.value
                ? "rgba(30, 41, 59, 0.8)"
                : "rgba(255, 255, 255, 0.9)";
            }
            el.style.transition = "none";
            el.style.animation = "none";
          });
        }
      },
    });

    const link = document.createElement("a");
    link.download = `taskpilot-log-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast.success("Log Decrypted & Saved", { id: toastId });
  } catch (err) {
    console.error("Capture Error:", err);
    toast.error("Visual Log Synthesis Failed", { id: toastId });
  }
};

// Sharing Logic
const generateShareUrl = async () => {
  const activeTasks = tasks.value;
  const data = JSON.stringify(activeTasks);
  const compressed = LZString.compressToEncodedURIComponent(data);
  const url = new URL(window.location.href);
  url.searchParams.set("share", compressed);
  const sharedUrl = url.toString();

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ url: sharedUrl })
  ) {
    try {
      await navigator.share({
        title: "TaskPilot Mission List",
        text: "Check out these operational objectives.",
        url: sharedUrl,
      });
      toast.success("Network Synchronized");
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
        copyToClipboard(sharedUrl);
      }
    }
  } else {
    copyToClipboard(sharedUrl);
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  isSharing.value = true;
  toast.success("Network Synchronized", {
    description: "Mission link copied to clipboard.",
  });
  setTimeout(() => {
    isSharing.value = false;
  }, 2000);
};

const hydrateFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const sharedData = params.get("share");

  if (sharedData) {
    try {
      const decompressed =
        LZString.decompressFromEncodedURIComponent(sharedData);
      const sharedTasks = JSON.parse(decompressed);

      if (
        confirm(
          `You've opened a shared project with ${sharedTasks.length} tasks. Would you like to import them into your workspace?`,
        )
      ) {
        // Merge strategy: Add non-duplicate names or just overwrite? Let's overwrite for simplicity in "collaboration"
        tasks.value = sharedTasks;
        saveTasks();
        // Clear param to avoid re-prompting
        window.history.replaceState({}, document.title, "/");
        toast.success("Project imported successfully!");
      }
    } catch (err) {
      console.error("Failed to hydrate:", err);
      toast.error("Failed to load shared project");
    }
  }
};

onMounted(() => {
  loadTasks();
  hydrateFromUrl();
  if (taskListRef.value) autoAnimate(taskListRef.value);
});

const handleDateUpdate = (val) => {
  if (val) {
    const d = new Date(val.year, val.month - 1, val.day);
    newTodoDueDate.value = format(d, "yyyy-MM-dd");
  } else {
    newTodoDueDate.value = null;
  }
};

// Theme Toggle Setup
const isDark = useDark();
const toggleDark = useToggle(isDark);

// Global watch for tasks to update localStorage
watch(tasks, saveTasks, { deep: true });
</script>

<template>
  <TooltipProvider>
    <div
      class="min-h-screen bg-surface text-foreground font-sans selection:bg-primary/20 p-4 md:p-8 relative overflow-x-hidden transition-all duration-700"
    >
      <Toaster position="bottom-right" richColors closeButton />
      <div class="max-w-5xl mx-auto">
        <header
          class="mb-12 relative flex flex-col md:flex-row justify-between items-center md:items-start gap-8"
        >
          <div class="flex flex-col mr-auto">
            <div class="flex items-center justify-start gap-4 mb-2">
              <div
                class="bg-primary p-3 rounded-xl font-headings font-extrabold text-2xl shadow-lg shadow-primary/20 transition-transform duration-500 hover:rotate-6 text-primary-foreground"
              >
                TP
              </div>
              <h1
                class="text-4xl md:text-5xl font-headings font-extrabold tracking-tighter text-foreground"
              >
                TASK PILOT
              </h1>
            </div>
            <p
              class="text-muted-foreground font-headings font-black uppercase tracking-[0.3em] text-[10px] opacity-60 text-center md:text-left"
            >
              Automated Productivity Navigation // V4.0
            </p>
          </div>

          <!-- Global Actions Container -->
          <div class="flex items-center gap-4 w-full md:w-auto">
            <!-- Global Search -->
            <div class="relative group w-full md:w-auto">
              <div
                class="absolute z-10 inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors"
              >
                <ph-magnifying-glass :size="18" />
              </div>

              <Input
                v-model="searchQuery"
                placeholder="Search missions..."
                class="pl-12 h-11 w-full md:w-64 bg-surface-container-high border-outline-variant/40 focus-visible:ring-primary/30 rounded-2xl backdrop-blur-xl shadow-inner font-headings font-bold placeholder:text-muted-foreground/40! caret-primary transition-all duration-300 focus:md:w-80"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              @click="toggleDark()"
              class="rounded-full h-11 w-11 border-outline-variant/20 bg-surface-container-highest backdrop-blur-sm hover:bg-surface-container-highest/70 transition-all duration-300 shadow-sm shadow-primary/20 shrink-0"
            >
              <ph-moon
                v-if="isDark"
                :size="20"
                class="text-primary"
                weight="fill"
              />
              <ph-sun v-else :size="20" class="text-accent" weight="fill" />
            </Button>
          </div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <!-- Sidebar -->
          <aside class="space-y-6">
            <!-- CATEGORY CARD -->
            <Card
              class="bg-surface-container-low border border-border/50 shadow-sm overflow-hidden"
            >
              <CardHeader class="pb-2">
                <CardTitle
                  class="text-[10px] font-headings font-black uppercase tracking-[0.2em] text-primary/60"
                  >Operational Sectors</CardTitle
                >
              </CardHeader>
              <CardContent class="p-2 space-y-1">
                <div
                  v-for="cat in categories"
                  :key="cat.name"
                  @click="currentCategory = cat.name"
                  :class="
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group relative z-10',
                      currentCategory === cat.name
                        ? 'bg-primary/10 text-primary shadow-inner border border-primary/20'
                        : 'text-muted-foreground hover:bg-surface-container-high hover:text-foreground',
                    )
                  "
                >
                  <component :is="cat.icon" :size="18" />
                  <span class="font-bold text-sm tracking-tight">{{
                    cat.name
                  }}</span>
                  <div
                    v-if="currentCategory === cat.name"
                    class="absolute left-0 w-1 h-4 bg-primary rounded-r-full"
                  />
                </div>
              </CardContent>
            </Card>

            <!-- MISION PROGRESS CARD -->
            <Card
              class="bg-surface-container-low border border-border/50 shadow-sm"
            >
              <CardHeader class="pb-2">
                <CardTitle
                  class="text-[10px] text-center font-headings font-black uppercase tracking-[0.2em] text-primary/60"
                  >Mission Progress</CardTitle
                >
              </CardHeader>
              <CardContent class="text-center p-6 pt-2 relative z-10">
                <div
                  class="text-4xl font-headings font-black text-primary mb-1"
                >
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

          <!-- Main Content -->
          <main class="space-y-6">
            <!-- ADD TASK -->
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
                      class="px-3 pb-3 pt-0 border-t-0 flex items-center justify-between"
                    >
                      <div class="flex items-center gap-1.5">
                        <!-- Priority Selector -->
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
                                <ph-calendar-blank
                                  :size="14"
                                  class="text-primary"
                                />
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

                      <!-- Launch Button -->
                      <InputGroupButton
                        @click="addTask"
                        :disabled="!newTodoInput.trim()"
                        class="h-9! px-4! bg-primary hover:bg-primary/80 text-primary-foreground font-black uppercase tracking-wider rounded-lg gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                      >
                        Launch
                        <ph-paper-plane-right :size="10" weight="bold" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  <p
                    class="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-1"
                  >
                    Protip: Consolidate objectives into clear, actionable task
                    threads.
                  </p>
                </div>
              </CardContent>
            </Card>

            <!-- TASK LIST -->
            <Card
              class="bg-surface-container-low dark:bg-surface-container-high/80 border border-border/50 shadow-sm overflow-hidden min-h-[400px] flex flex-col"
            >
              <div ref="taskListRef" class="flex flex-col grow">
                <CardHeader
                  class="flex flex-row items-center justify-between pb-6"
                >
                  <CardTitle
                    class="text-xl font-headings font-extrabold tracking-tight"
                  >
                    Mission Feed:
                    <span class="text-primary ml-1">
                      {{ currentCategory }}</span
                    >
                  </CardTitle>
                  <div
                    class="flex gap-0.5 bg-surface-container-highest/50 rounded-xl p-1 pointer-events-auto shadow-sm shadow-primary/20"
                  >
                    <Button
                      v-for="filter in [
                        'all',
                        'active',
                        'completed',
                        'expired',
                      ]"
                      :key="filter"
                      variant="ghost"
                      size="sm"
                      @click="currentFilter = filter"
                      :class="
                        cn(
                          'h-7.5 px-2.5 text-[10px] font-headings font-black uppercase tracking-widest transition-all duration-300',
                          currentFilter === filter
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground rounded-lg'
                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-primary/20',
                        )
                      "
                    >
                      {{ filter === "completed" ? "Done" : filter }}
                    </Button>
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

                  <Item
                    v-for="task in filteredTasks"
                    :key="task.id"
                    :class="
                      cn(
                        'group p-4 transition-all duration-300 border-none hover:bg-surface-container-highest/40 rounded-xl mb-2',
                        task.isCompleted
                          ? 'opacity-50'
                          : 'bg-surface-container-highest/60 shadow-sm',
                      )
                    "
                  >
                    <ItemMedia class="pl-2">
                      <Checkbox
                        :model-value="task.isCompleted"
                        @update:model-value="toggleTodoStatus(task)"
                        class="w-5 h-5 border-2 border-primary/20 rounded-lg data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-300"
                      />
                    </ItemMedia>

                    <ItemContent class="flex-1 w-full overflow-hidden">
                      <div class="flex items-center gap-3">
                        <Textarea
                          v-if="task.isEditing"
                          v-focus
                          v-model="task.name"
                          @blur="saveEdit(task)"
                          @keyup.enter="saveEdit(task)"
                          @keyup.esc="cancelEdit(task)"
                          class="w-full min-h-8 text-base font-headings font-bold py-1 px-3 bg-surface-container/50 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none no-scrollbar break-all"
                        />
                        <ItemTitle
                          v-else
                          :class="
                            cn(
                              'text-base font-headings font-bold transition-all duration-300 text-foreground whitespace-pre-wrap break-all leading-tight grow min-w-0',
                              task.isCompleted &&
                                'line-through text-muted-foreground opacity-50',
                            )
                          "
                        >
                          {{ task.name }}
                        </ItemTitle>

                        <!-- Status Badges -->
                        <div class="flex gap-1.5 shrink-0">
                          <span
                            v-if="isTaskExpired(task)"
                            class="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground animate-pulse"
                          >
                            Expired
                          </span>
                          <span
                            v-else-if="task.isCompleted"
                            class="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-primary text-primary-foreground"
                          >
                            Done
                          </span>
                        </div>
                      </div>

                      <ItemDescription class="flex items-center gap-3 mt-1.5">
                        <span
                          :class="
                            cn(
                              'text-[9px] font-headings font-black uppercase tracking-widest px-2 py-0.5 rounded-md border',
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
                          class="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-tight"
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
                              'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-tight',
                              isTaskExpired(task)
                                ? 'text-destructive'
                                : 'text-primary/70',
                            )
                          "
                        >
                          <ph-clock :size="12" />
                          {{
                            new Date(task.dueDate).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )
                          }}
                        </span>
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions class="flex items-center">
                      <template v-if="task.isEditing">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all mr-1"
                              @mousedown.prevent="saveEdit(task)"
                            >
                              <ph-check-circle :size="18" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            class="bg-primary text-primary-foreground border-none font-bold text-xs"
                          >
                            Save Edit
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              @mousedown.prevent="cancelEdit(task)"
                            >
                              <ph-x :size="18" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            class="bg-destructive text-destructive-foreground border-none font-bold text-xs"
                          >
                            Cancel
                          </TooltipContent>
                        </Tooltip>
                      </template>
                      <template v-else>
                        <Tooltip v-if="!task.isCompleted">
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all mr-1"
                              @click="startEditing(task)"
                            >
                              <ph-pencil-simple-line :size="18" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            class="bg-primary text-primary-foreground border-none font-bold text-xs"
                          >
                            Edit Task
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="opacity-0 group-hover:opacity-100 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              @click="deleteTodo(task)"
                            >
                              <ph-trash :size="18" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            class="bg-destructive text-destructive-foreground border-none font-bold text-xs"
                          >
                            Delete Task
                          </TooltipContent>
                        </Tooltip>
                      </template>
                    </ItemActions>
                  </Item>
                </CardContent>

                <CardFooter
                  class="flex items-center justify-between p-6 pt-4 mt-auto border-t border-border/5"
                >
                  <div class="flex gap-2">
                    <Button
                      @click="generateShareUrl"
                      class="bg-primary hover:bg-primary/80 text-primary-foreground font-headings font-black uppercase tracking-wider h-9 px-5 rounded-lg gap-2 active:scale-95 shadow-lg shadow-primary/10 transition-all"
                    >
                      <template v-if="isSharing">
                        <ph-check-circle :size="18" weight="bold" />
                        Copied!
                      </template>
                      <template v-else>
                        <ph-share-network :size="18" weight="bold" />
                        Share Task
                      </template>
                    </Button>
                    <Button
                      variant="ghost"
                      @click="captureScreenshot"
                      class="h-9 px-5 rounded-lg gap-2 text-muted-foreground/60 hover:text-foreground hover:bg-surface-container-highest border border-outline-variant/10 active:scale-95 transition-all font-headings font-black text-[10px] uppercase tracking-widest"
                    >
                      <ph-camera :size="18" />
                      Visual Log
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    @click="clearAll"
                    class="h-9 px-4 rounded-lg text-destructive font-headings font-black text-[10px] uppercase tracking-widest hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                  >
                    Wipe Interface
                  </Button>
                </CardFooter>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  </TooltipProvider>
</template>

<style>
/* Font import handled in index.css */

/* Hide scrollbar but keep functionality */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom Glass class already defined in index.css */

/* Shadow overrides for standard buttons/inputs to match Premium design */
input::placeholder {
  color: hsla(var(--muted-foreground), 0.4);
}

select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='hsla(var(--muted-foreground), 0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
}

option {
  background-color: hsl(var(--secondary));
  color: hsl(var(--foreground));
  padding: 0.5rem;
}
</style>
