
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Todo {
  _id?: string;
  title: string;
  completed: boolean;
  userId: string;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/api/todos';

  constructor(private http: HttpClient) {}

  getTodos(userId: string): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/${userId}`);
  }

  addTodo(todo: Todo): Observable<any> {
    return this.http.post(this.apiUrl, todo);
  }

  updateTodo(id: string, todo: Partial<Todo>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, todo);
  }

  deleteTodo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}