import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ConsentService } from '../../services/consent.service';
import { ConsentFormComponent } from '../consent-form/consent-form.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @ViewChild(ConsentFormComponent) consentForm!: ConsentFormComponent;

  registerForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private consentService: ConsentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]]
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    if (!this.consentForm || !this.consentForm.isValid()) {
      this.errorMessage = 'Please select at least one consent option';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const consentData = this.consentForm.getConsentData();

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.consentService.submitConsent(consentData).subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Registration successful but consent submission failed. Please try again.';
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
