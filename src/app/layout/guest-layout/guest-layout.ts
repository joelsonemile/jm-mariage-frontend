import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavItemComponent } from '../../shared/components/bottom-nav-item/bottom-nav-item';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavItemComponent],
  templateUrl: './guest-layout.html',
})
export class GuestLayoutComponent {}
