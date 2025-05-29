import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.next(savedTheme === 'dark');
      this.setTheme(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.next(prefersDark);
      this.setTheme(prefersDark);
    }
  }

  toggleTheme() {
    const newTheme = !this.isDarkMode.value;
    this.isDarkMode.next(newTheme);
    this.setTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  private setTheme(isDark: boolean) {
    document.body.classList.toggle('dark-theme', isDark);
  }
} 