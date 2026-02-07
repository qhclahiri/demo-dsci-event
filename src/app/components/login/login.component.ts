import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConsentService } from '../../services/consent.service';
import { ConsentFormComponent } from '../consent-form/consent-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild(ConsentFormComponent) consentForm!: ConsentFormComponent;

  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private consentService: ConsentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    if (!this.consentForm || !this.consentForm.isValid()) {
      this.errorMessage = 'Please select at least one consent option';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const consentData = this.consentForm.getConsentData();

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.consentService.submitConsent(consentData).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Login successful but consent submission failed. Redirecting to dashboard...';
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
