<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Task, TaskStatus, TaskGroup } from '../types/Task';
import { taskGroupInfo } from '../types/Task';
import draggable from 'vuedraggable';
import { Icon } from '@iconify/vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

const tasks = ref<Task[]>([
  { id: 1, title: '牛乳を買う', description: 'スーパーで低脂肪牛乳を購入する', status: 'todo', group: 'daily', timeTracking: null },
  { id: 2, title: '本を読む', description: '「効果的な時間管理」の第3章まで読む', status: 'in-progress', group: 'first', timeTracking: null },
  { id: 3, title: 'プレゼンの準備', description: '来週の会議用のスライドを作成する', status: 'review', group: 'todo', timeTracking: null },
  { id: 4, title: 'バグの修正', description: 'アプリのクラッシュ問題を解決する', status: 'testing', group: 'willdo', timeTracking: null },
  { id: 5, title: 'レポートの提出', description: '四半期の売上レポートを作成し、上司に提出する', status: 'done', group: 'willdo', timeTracking: null },
]);

const newTask = ref<Task>({ id: 0, title: '', description: '', status: 'todo', group: 'todo', timeTracking: null });
const editingTask = ref<Task | null>(null);
const isEditModalOpen = ref(false);
const isAddModalOpen = ref(false);
const activeTask = ref<Task | null>(null);
const activeTaskHeight = ref('h-52');

const editor = useEditor({
  extensions: [
    StarterKit,
  ],
  content: '',
});

const addTask = () => {
  if (newTask.value.title.trim()) {
    tasks.value.push({
      ...newTask.value,
      id: tasks.value.length + 1,
      description: editor.value?.getHTML() || '',
    });
    newTask.value = { id: 0, title: '', description: '', status: 'todo', group: 'todo', timeTracking: null };
    editor.value?.commands.setContent('');
    isAddModalOpen.value = false;
  }
};

const removeTask = (taskId: number) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId);
  if (activeTask.value && activeTask.value.id === taskId) {
    activeTask.value = null;
  }
};

const openEditModal = (task: Task) => {
  editingTask.value = { ...task };
  editor.value?.commands.setContent(task.description);
  isEditModalOpen.value = true;
};

const openAddModal = () => {
  isAddModalOpen.value = true;
  editor.value?.commands.setContent('');
};

const saveTask = () => {
  if (editingTask.value) {
    const index = tasks.value.findIndex(t => t.id === editingTask.value!.id);
    if (index !== -1) {
      tasks.value[index] = { 
        ...editingTask.value,
        description: editor.value?.getHTML() || '',
      };
      if (activeTask.value && activeTask.value.id === editingTask.value.id) {
        activeTask.value = { ...tasks.value[index] };
      }
    }
    closeEditModal();
  }
};

const closeEditModal = () => {
  editingTask.value = null;
  isEditModalOpen.value = false;
};

const closeAddModal = () => {
  newTask.value = { id: 0, title: '', description: '', status: 'todo', group: 'todo', timeTracking: null };
  isAddModalOpen.value = false;
};

const statusColumns: { title: string; status: TaskStatus; icon: string }[] = [
  { title: 'TODO', status: 'todo', icon: 'mdi:clipboard-text-outline' },
  { title: '進行中', status: 'in-progress', icon: 'mdi:progress-clock' },
  { title: 'レビュー', status: 'review', icon: 'mdi:eye-outline' },
  { title: 'テスト', status: 'testing', icon: 'mdi:test-tube' },
  { title: '完了', status: 'done', icon: 'mdi:check-circle-outline' },
];

const getTasksByGroup = computed(() => {
  return (group: TaskGroup) => tasks.value.filter(task => task.group === group);
});

const onDragEnd = (event: any) => {
  const { added, removed } = event;
  if (added) {
    const task = added.element;
    task.group = added.newIndex !== undefined ? Object.keys(taskGroupInfo)[added.newIndex] as TaskGroup : task.group;
  }
};

const toggleTimeTracking = (task: Task) => {
  if (task.timeTracking) {
    task.timeTracking = null;
  } else {
    task.timeTracking = Date.now();
  }
};

const formatElapsedTime = (startTime: number) => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const setActiveTask = (task: Task) => {
  activeTask.value = task;
};

const toggleActiveTaskHeight = () => {
  activeTaskHeight.value = activeTaskHeight.value === 'h-52' ? 'h-auto' : 'h-52';
};

onMounted(() => {
  const firstTodoTask = tasks.value.find(task => task.group === 'todo');
  if (firstTodoTask) {
    setActiveTask(firstTodoTask);
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-6">タスクボード</h1>
    
    <!-- Active Task Display -->
    <div v-if="activeTask" :class="['bg-white p-4 rounded-lg shadow mb-6 overflow-hidden transition-all duration-300 ease-in-out', activeTaskHeight]">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-2xl font-semibold">{{ activeTask.title }}</h2>
        <button @click="toggleActiveTaskHeight" class="btn btn-sm btn-ghost">
          <Icon :icon="activeTaskHeight === 'h-52' ? 'mdi:chevron-down' : 'mdi:chevron-up'" />
        </button>
      </div>
      <div v-html="activeTask.description" class="text-gray-600 mb-2"></div>
      <div class="flex items-center justify-between">
        <span class="badge badge-primary">{{ taskGroupInfo[activeTask.group].title }}</span>
        <span class="badge badge-secondary">{{ statusColumns.find(col => col.status === activeTask.status)?.title }}</span>
        <div v-if="activeTask.timeTracking" class="text-sm text-gray-500">
          経過時間: {{ formatElapsedTime(activeTask.timeTracking) }}
        </div>
      </div>
    </div>

    <div class="mb-4">
      <button @click="openAddModal" class="btn btn-primary">
        <Icon icon="mdi:plus" class="mr-1" /> タスクを追加
      </button>
    </div>
    <div class="grid grid-cols-4 gap-4">
      <!-- TODO column -->
      <div class="bg-gray-100 p-4 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4 group relative inline-block">
          TODO
          <span class="hidden group-hover:block absolute left-full ml-2 bg-gray-800 text-white text-sm p-2 rounded">
            {{ taskGroupInfo.todo.description }}
          </span>
        </h2>
        <draggable
          :list="getTasksByGroup('todo')"
          group="tasks"
          item-key="id"
          class="space-y-2"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div 
              :class="['bg-white p-2 rounded shadow group relative cursor-pointer', { 'bg-blue-100': element.timeTracking }]"
              @click="setActiveTask(element)"
            >
              <span>{{ element.title }}</span>
              <div v-if="element.timeTracking" class="text-xs text-gray-500 mt-1">
                {{ formatElapsedTime(element.timeTracking) }}
              </div>
              <div class="hidden group-hover:flex absolute right-2 top-2 items-center">
                <button @click.stop="toggleTimeTracking(element)" class="btn btn-xs btn-ghost mr-1">
                  <Icon :icon="element.timeTracking ? 'mdi:stop' : 'mdi:play'" />
                </button>
                <div class="dropdown dropdown-end">
                  <label tabindex="0" class="btn btn-xs btn-ghost m-1 lg:hidden">...</label>
                  <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><a @click.stop="openEditModal(element)">編集</a></li>
                    <li><a @click.stop="removeTask(element.id)" class="text-error">削除</a></li>
                  </ul>
                </div>
                <div class="hidden lg:flex">
                  <button @click.stop="openEditModal(element)" class="btn btn-xs btn-ghost mr-1">
                    <Icon icon="mdi:pencil" />
                  </button>
                  <button @click.stop="removeTask(element.id)" class="btn btn-xs btn-ghost text-error">
                    <Icon icon="mdi:delete" />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
      <!-- Other groups -->
      <div class="col-span-3 space-y-8">
        <div v-for="(groupInfo, group) in taskGroupInfo" :key="group" class="bg-gray-100 p-4 rounded-lg" v-if="group !== 'todo'">
          <h2 class="text-2xl font-semibold mb-2 group relative inline-block">
            {{ groupInfo.title }}
            <span class="hidden group-hover:block absolute left-full ml-2 bg-gray-800 text-white text-sm p-2 rounded">
              {{ groupInfo.description }}
            </span>
          </h2>
          <draggable
            :list="getTasksByGroup(group as TaskGroup)"
            group="tasks"
            item-key="id"
            class="space-y-2"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <div 
                :class="['bg-white p-2 rounded shadow group relative cursor-pointer', { 'bg-blue-100': element.timeTracking }]"
                @click="setActiveTask(element)"
              >
                <span>{{ element.title }}</span>
                <div v-if="element.timeTracking" class="text-xs text-gray-500 mt-1">
                  {{ formatElapsedTime(element.timeTracking) }}
                </div>
                <div class="hidden group-hover:flex absolute right-2 top-2 items-center">
                  <button @click.stop="toggleTimeTracking(element)" class="btn btn-xs btn-ghost mr-1">
                    <Icon :icon="element.timeTracking ? 'mdi:stop' : 'mdi:play'" />
                  </button>
                  <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-xs btn-ghost m-1 lg:hidden">...</label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a @click.stop="openEditModal(element)">編集</a></li>
                      <li><a @click.stop="removeTask(element.id)" class="text-error">削除</a></li>
                    </ul>
                  </div>
                  <div class="hidden lg:flex">
                    <button @click.stop="openEditModal(element)" class="btn btn-xs btn-ghost mr-1">
                      <Icon icon="mdi:pencil" />
                    </button>
                    <button @click.stop="removeTask(element.id)" class="btn btn-xs btn-ghost text-error">
                      <Icon icon="mdi:delete" />
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-3/4 max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">タスクの編集</h2>
        <input v-model="editingTask.title" class="input input-bordered w-full mb-4" placeholder="タスク名">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">タスクの説明</label>
          <editor-content :editor="editor" class="prose max-w-none p-4 border rounded-lg" />
        </div>
        <select v-model="editingTask.group" class="select select-bordered w-full mb-4">
          <option v-for="(info, group) in taskGroupInfo" :key="group" :value="group">{{ info.title }}</option>
        </select>
        <select v-model="editingTask.status" class="select select-bordered w-full mb-4">
          <option v-for="column in statusColumns" :key="column.status" :value="column.status">{{ column.title }}</option>
        </select>
        <div class="flex justify-end">
          <button @click="closeEditModal" class="btn btn-ghost mr-2">キャンセル</button>
          <button @click="saveTask" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-3/4 max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">新しいタスクを追加</h2>
        <input v-model="newTask.title" class="input input-bordered w-full mb-4" placeholder="タスク名">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">タスクの説明</label>
          <editor-content :editor="editor" class="prose max-w-none p-4 border rounded-lg" />
        </div>
        <select v-model="newTask.group" class="select select-bordered w-full mb-4">
          <option v-for="(info, group) in taskGroupInfo" :key="group" :value="group">{{ info.title }}</option>
        </select>
        <select v-model="newTask.status" class="select select-bordered w-full mb-4">
          <option v-for="column in statusColumns" :key="column.status" :value="column.status">{{ column.title }}</option>
        </select>
        <div class="flex justify-end">
          <button @click="closeAddModal" class="btn btn-ghost mr-2">キャンセル</button>
          <button @click="addTask" class="btn btn-primary">追加</button>
        </div>
      </div>
    </div>
  </div>
</template>