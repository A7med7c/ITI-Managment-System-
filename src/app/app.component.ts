import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  isAuthPage(): boolean {
    const currentUrl = this.router.url.split('?')[0];
    return currentUrl === '/login' || currentUrl === '/register';
  }
}
