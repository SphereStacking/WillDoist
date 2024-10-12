export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  group: TaskGroup;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'testing' | 'done';
export type TaskGroup = 'daily' | 'first' | 'todo' | 'willdo';

export const taskGroupInfo = {
  daily: {
    title: 'デイリータスク',
    description: '毎日定期的にやるタスク'
  },
  first: {
    title: 'ファーストタスク',
    description: 'その日最初に取り組む最重要タスク'
  },
  todo: {
    title: 'TODOリスト',
    description: '長期的な視点で必要なタスクを記録する'
  },
  willdo: {
    title: 'WILLDOリスト',
    description: '確実に実行するタスクのみをまとめたリスト'
  }
};