export type Task = { id: string; subject: string; status: 'pending' | 'in_progress' | 'completed' }

declare module 'claude-code' {
  interface PluginState {
    'task-progress': { tasks: Task[] }
  }
}
