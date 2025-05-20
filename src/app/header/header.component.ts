import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  currentRoute = '';
  private authListenerSubs!: Subscription;
  private routeSub!: Subscription;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
      });

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
    this.routeSub.unsubscribe();
  }

  // Utility getters for cleaner template logic
  get isLoginOrSignupPage(): boolean {
    return this.currentRoute === '/login' || this.currentRoute === '/signup';
  }

  get isAuthenticatedAndNotAuthPage(): boolean {
    return this.userIsAuthenticated && !this.isLoginOrSignupPage;
  }

  get showAuthLinks(): boolean {
    return !this.userIsAuthenticated && this.isLoginOrSignupPage;
  }
}