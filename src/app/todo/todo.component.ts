import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../services/todo.service';
import { AuthService } from '../authentication/auth.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.css']
})
export class TodoComponent implements OnInit {
  newTodo: string = '';
  todos: Todo[] = [];
  userId: string | null = null; // Allow null to avoid type error

  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadTodos();
    }
  }

  loadTodos() {
    if (!this.userId) return;
    this.todoService.getTodos(this.userId).subscribe((todos) => {
      this.todos = todos;
    });
  }

  addTodo() {
    if (!this.newTodo.trim() || !this.userId) return;

    const todo: Todo = {
      title: this.newTodo,
      completed: false,
      userId: this.userId,
      comment: ''
    };

    this.todoService.addTodo(todo).subscribe(() => {
      this.newTodo = '';
      this.loadTodos();
    });
  }

  toggleComplete(todo: Todo) {
    const updated = { completed: !todo.completed };
    this.todoService.updateTodo(todo._id!, updated).subscribe(() => {
      todo.completed = !todo.completed;
    });
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter(t => t._id !== id);
    });
  }

  saveComment(todo: Todo) {
    if (!todo._id) return;
    this.todoService.updateTodo(todo._id, { comment: todo.comment }).subscribe(() => {
      // Optionally handle post-save actions
    });
  }
}
