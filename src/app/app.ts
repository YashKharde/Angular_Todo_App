import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'calm-tasks.todos';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly todos = signal<Todo[]>(this.loadTodos());
  protected readonly taskText = signal('');
  protected readonly editingId = signal<string | null>(null);
  protected readonly remaining = computed(() => this.todos().filter((todo) => !todo.completed).length);
  protected readonly completed = computed(() => this.todos().filter((todo) => todo.completed).length);

  protected saveTask(): void {
    const title = this.taskText().trim();
    if (!title) return;
    const editingId = this.editingId();
    if (editingId) {
      this.todos.update((todos) => todos.map((todo) => todo.id === editingId ? { ...todo, title } : todo));
      this.editingId.set(null);
    } else {
      this.todos.update((todos) => [{ id: crypto.randomUUID(), title, completed: false, createdAt: Date.now() }, ...todos]);
    }
    this.taskText.set('');
    this.persistTodos();
  }

  protected editTask(todo: Todo): void { this.editingId.set(todo.id); this.taskText.set(todo.title); }
  protected cancelEdit(): void { this.editingId.set(null); this.taskText.set(''); }
  protected deleteTask(id: string): void {
    this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
    if (this.editingId() === id) this.cancelEdit();
    this.persistTodos();
  }
  protected toggleTask(id: string): void {
    this.todos.update((todos) => todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    this.persistTodos();
  }
  protected clearCompleted(): void { this.todos.update((todos) => todos.filter((todo) => !todo.completed)); this.persistTodos(); }
  private loadTodos(): Todo[] {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? JSON.parse(saved) as Todo[] : []; } catch { return []; }
  }
  private persistTodos(): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos())); }
}
