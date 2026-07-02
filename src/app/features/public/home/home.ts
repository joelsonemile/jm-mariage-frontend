import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CountdownComponent } from '../../../shared/components/countdown/countdown';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CountdownComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  readonly info = signal<WeddingInfo | null>(null);
  readonly fallbackDate = '2026-09-05T15:00:00+01:00';

  readonly dateLabel = computed(
    () => formatWeddingDateLabel(this.info()?.date) || this.info()?.dateLabel || '05 Septembre 2026'
  );

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    this.info.set(await this.weddingInfoService.get());
  }
}
