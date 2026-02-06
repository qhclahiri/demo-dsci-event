import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: () => {
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: () => {
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
