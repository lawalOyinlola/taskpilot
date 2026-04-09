<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { addDays, format } from "date-fns";
import autoAnimate from "@formkit/auto-animate";
import { toPng } from "html-to-image";
import LZString from "lz-string";
import { toast } from "vue-sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout components
import AppHeader from "@/components/layout/AppHeader.vue";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppFooter from "@/components/layout/AppFooter.vue";

// Task components
import AddTask from "@/components/tasks/AddTask.vue";
import TaskList from "@/components/tasks/TaskList.vue";

// Icons and utilities
import {
  PhSquaresFour,
  PhBriefcase,
  PhUser,
  PhRobot,
  PhHeartbeat,
  PhTag,
} from "@phosphor-icons/vue";
import { truncate, isTaskExpired } from "@/lib/task-utils";

// State
const tasks = ref([]);
const currentFilter = ref("all");
const currentCategory = ref("All");
const searchQuery = ref("");
const isSharing = ref(false);
const taskListRef = ref(null);

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

const handleAddTask = (taskData) => {
  const defaultDate = format(addDays(new Date(), 7), "yyyy-MM-dd");

  tasks.value.unshift({
    id: Date.now(),
    name: taskData.name,
    priority: taskData.priority ?? "med",
    category:
      !taskData.category || taskData.category === "All"
        ? "General"
        : taskData.category,
    dueDate: taskData.dueDate ?? defaultDate,
    isCompleted: false,
    isEditing: false,
    createdAt: new Date().toISOString(),
  });

  toast.success("Mission Assigned", {
    description: "New objective prioritized in your queue.",
  });
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

  const deletedTask = { ...tasks.value[index] };
  const deletedIndex = index;

  tasks.value.splice(index, 1);
  saveTasks();

  toast.info("Mission Terminated", {
    description: `Target removed: ${truncate(task.name)}`,
    action: {
      label: "Undo",
      onClick: () => {
        if (deletedTask) {
          tasks.value.splice(deletedIndex, 0, deletedTask);
          saveTasks();
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

// Screenshot Logic
const captureScreenshot = async () => {
  const el = taskListRef.value?.taskListRef;
  if (!el) return;
  const toastId = toast.loading("Synthesizing Visual Log...");

  try {
    const dataUrl = await toPng(el, {
      backgroundColor: isDark.value ? "#0f172a" : "#f8fafc",
      cacheBust: true,
      quality: 0.95,
      pixelRatio: 2,
      style: {
        transform: "scale(1)",
      },
    });

    const link = document.createElement("a");
    link.download = `taskpilot-log-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();

    toast.success("Log Decrypted & Saved", { id: toastId });
  } catch (err) {
    console.error("Capture Error:", err);
    toast.error("Visual Log Synthesis Failed", { id: toastId });
  }
};

// Sharing Logic
const generateShareUrl = async () => {
  const data = JSON.stringify(tasks.value);
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
        await copyToClipboard(sharedUrl);
      }
    }
  } else {
    await copyToClipboard(sharedUrl);
  }
};

const copyToClipboard = async (text) => {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(text);
    isSharing.value = true;
    toast.success("Network Synchronized", {
      description: "Mission link copied to clipboard.",
    });
    setTimeout(() => {
      isSharing.value = false;
    }, 2000);
  } catch (err) {
    console.error("Clipboard write failed:", err);
    toast.error("Network Sync Failed", {
      description: "Couldn't copy the mission link on this device.",
    });
  }
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
        tasks.value = sharedTasks;
        saveTasks();
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
  const el = taskListRef.value?.taskListRef;
  if (el) autoAnimate(el);
});

// Theme Toggle Setup
const isDark = useDark();
const toggleDark = useToggle(isDark);

// Global watch for tasks to update localStorage
watch(tasks, saveTasks, { deep: true });
</script>

<template>
  <TooltipProvider>
    <div
      class="min-h-screen bg-surface text-foreground font-sans selection:bg-primary/20 p-3 py-8 sm:p-4 md:p-8 relative overflow-x-hidden transition-all duration-700"
    >
      <Toaster position="bottom-right" richColors closeButton />
      <div class="max-w-5xl mx-auto w-full overflow-hidden">
        
        <AppHeader 
          v-model:search-query="searchQuery"
          :is-dark="isDark"
          @toggle-dark="toggleDark()"
        />

        <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          
          <AppSidebar 
            :categories="categories"
            v-model:current-category="currentCategory"
            :stats="stats"
          />

          <main class="space-y-6 order-first lg:order-last">
            
            <AddTask 
              :categories="categories"
              :priorities="priorities"
              @add-task="handleAddTask"
            />

            <TaskList 
              ref="taskListRef"
              :tasks="tasks"
              :filtered-tasks="filteredTasks"
              v-model:current-category="currentCategory"
              v-model:current-filter="currentFilter"
              :categories="categories"
              :is-sharing="isSharing"
              :get-category-icon="getCategoryIcon"
              @toggle-status="toggleTodoStatus"
              @delete-task="deleteTodo"
              @save-edit="saveEdit"
              @start-editing="startEditing"
              @cancel-edit="cancelEdit"
              @share="generateShareUrl"
              @screenshot="captureScreenshot"
              @clear-all="clearAll"
            />
          </main>
        </div>

        <AppFooter />
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
