import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../authentication/auth.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../services/theme.service';

@Component({  
  selector: 'app-header',  
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})  
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs!: Subscription;
  isDarkMode = false;
  private themeSub!: Subscription;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });

    this.themeSub = this.themeService.isDarkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  onLogout() {
    this.isLoading = true;
    this.authService.logout();
    setTimeout(() => {
      this.isLoading = false;
    }, 1000); // Show spinner for 1 second
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.themeSub.unsubscribe();
  }
}  