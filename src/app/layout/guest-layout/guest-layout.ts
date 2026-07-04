import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavItemComponent } from '../../shared/components/bottom-nav-item/bottom-nav-item';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle';
import { WeddingInfoService } from '../../core/services/wedding-info.service';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavItemComponent, ThemeToggleComponent],
  templateUrl: './guest-layout.html',
})
export class GuestLayoutComponent implements OnInit {
  readonly mapUrl = signal<string>('');

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    const info = await this.weddingInfoService.get();
    this.mapUrl.set(info?.mapUrl || '');
  }
}
