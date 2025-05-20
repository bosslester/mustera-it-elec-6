import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.signupForm.value;

    this.authService.createUser(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err: { error: { message: string; }; }) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Signup failed. Please try again.';
        console.error('Signup error:', err);
      }
    });
  }
}