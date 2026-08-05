import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';
import { CountdownComponent } from '../../../shared/components/countdown/countdown';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CountdownComponent, ThemeToggleComponent, IconComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly info = signal<WeddingInfo | null>(null);
  readonly fallbackDate = '2026-09-12T15:00:00+01:00';

  readonly dateLabel = computed(
    () =>
      formatWeddingDateLabel(this.info()?.date) || this.info()?.dateLabel || '12 Septembre 2026',
  );

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    this.info.set(await this.weddingInfoService.get());
  }
}
