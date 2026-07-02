import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-admin-gifts',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './gifts.html',
})
export class AdminGiftsComponent implements OnInit {
  readonly items = signal<string[]>([]);
  readonly saving = signal(false);
  newItem = '';

  constructor(private weddingInfoService: WeddingInfoService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    const info = await this.weddingInfoService.get();
    this.items.set(info?.giftRegistry || []);
  }

  addItem(): void {
    if (!this.newItem.trim()) return;
    this.items.update((list) => [...list, this.newItem.trim()]);
    this.newItem = '';
  }

  removeItem(index: number): void {
    this.items.update((list) => list.filter((_, i) => i !== index));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      await this.weddingInfoService.update({ giftRegistry: this.items() });
      this.toast.show('Liste de cadeaux mise à jour.', 'success');
    } finally {
      this.saving.set(false);
    }
  }
}
