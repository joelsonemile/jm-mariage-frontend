import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-guest-infos',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './infos.html',
})
export class GuestInfosComponent implements OnInit {
  readonly info = signal<WeddingInfo | null>(null);

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    this.info.set(await this.weddingInfoService.get());
  }

  dateLabel(info: WeddingInfo): string {
    return formatWeddingDateLabel(info.date) || info.dateLabel;
  }
}
