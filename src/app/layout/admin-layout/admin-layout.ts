import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BottomNavItemComponent } from '../../shared/components/bottom-nav-item/bottom-nav-item';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BottomNavItemComponent, ThemeToggleComponent],
  templateUrl: './admin-layout.html',
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
