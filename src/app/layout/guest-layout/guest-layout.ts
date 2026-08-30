import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavItemComponent } from '../../shared/components/bottom-nav-item/bottom-nav-item';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavItemComponent, ThemeToggleComponent],
  templateUrl: './guest-layout.html',
})
export class GuestLayoutComponent {
  constructor(public auth: AuthService) {}
}
