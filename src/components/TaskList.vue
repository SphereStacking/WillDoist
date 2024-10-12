<script setup lang="ts">
import { ref } from 'vue';
import type { Task } from '../types/Task';

const tasks = ref<Task[]>([
  { id: 1, title: '牛乳を買う', completed: false },
  { id: 2, title: '本を読む', completed: true },
]);

const newTaskTitle = ref('');

const addTask = () => {
  if (newTaskTitle.value.trim()) {
    tasks.value.push({
      id: tasks.value.length + 1,
      title: newTaskTitle.value,
      completed: false,
    });
    newTaskTitle.value = '';
  }
};

const toggleTask = (task: Task) => {
  task.completed = !task.completed;
};

const removeTask = (taskId: number) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId);
};
</script>

<template>
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-4">タスク一覧</h2>
    <ul class="space-y-2">
      <li v-for="task in tasks" :key="task.id" class="flex items-center justify-between p-2 border-b">
        <div class="flex items-center">
          <input type="checkbox" :checked="task.completed" @change="toggleTask(task)" class="checkbox checkbox-primary mr-2">
          <span :class="{ 'line-through text-gray-500': task.completed }">{{ task.title }}</span>
        </div>
        <button @click="removeTask(task.id)" class="btn btn-error btn-sm">削除</button>
      </li>
    </ul>
    <div class="mt-4 flex">
      <input v-model="newTaskTitle" placeholder="新しいタスクを入力" @keyup.enter="addTask" class="input input-bordered flex-grow mr-2">
      <button @click="addTask" class="btn btn-primary">追加</button>
    </div>
  </div>
</template>