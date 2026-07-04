import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { WeddingInfo } from '../../../core/models/wedding-info.model';

@Component({
  selector: 'app-itineraire',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itineraire.html',
})
export class ItineraireComponent implements OnInit {
  readonly info = signal<WeddingInfo | null>(null);
  readonly loading = signal(true);

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    this.info.set(await this.weddingInfoService.get());
    this.loading.set(false);
  }

  openMap(): void {
    const url = this.info()?.mapUrl;
    if (url) window.open(url, '_blank', 'noopener');
  }
}
