import { Component, OnInit } from '@angular/core';
import { TodoService, Todo } from '../services/todo.service';

@Component({
  selector: 'app-todo-toolbar',
  templateUrl: './todo-toolbar.component.html',
  styleUrls: ['./todo-toolbar.component.css']
})
export class TodoToolbarComponent implements OnInit {
  todos: Todo[] = [];
  newTodo = '';
  userId = 'your_user_id_here'; // Replace with actual user ID or inject AuthService

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.fetchTodos();
  }

  fetchTodos() {
    this.todoService.getTodos(this.userId).subscribe(data => this.todos = data);
  }

  addTodo() {
    if (!this.newTodo.trim()) return;
    const todo: Todo = {
      title: this.newTodo, completed: false, userId: this.userId,
      comment: ''
    };
    this.todoService.addTodo(todo).subscribe(() => {
      this.newTodo = '';
      this.fetchTodos();
    });
  }

  toggleComplete(todo: Todo) {
    this.todoService.updateTodo(todo._id!, { completed: !todo.completed }).subscribe(() => {
      this.fetchTodos();
    });
  }
}
