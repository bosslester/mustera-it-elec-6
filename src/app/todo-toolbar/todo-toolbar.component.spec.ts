import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoToolbarComponent } from './todo-toolbar.component';

describe('TodoToolbarComponent', () => {
  let component: TodoToolbarComponent;
  let fixture: ComponentFixture<TodoToolbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TodoToolbarComponent]
    });
    fixture = TestBed.createComponent(TodoToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
