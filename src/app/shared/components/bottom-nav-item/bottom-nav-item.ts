import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav-item.html',
})
export class BottomNavItemComponent {
  @Input({ required: true }) link!: string;
  @Input({ required: true }) label!: string;
  @Input() exact = false;
}
