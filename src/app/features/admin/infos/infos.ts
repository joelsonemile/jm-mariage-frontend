import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ToastService } from '../../../core/services/toast.service';
import { WeddingInfo } from '../../../core/models/wedding-info.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';

@Component({
  selector: 'app-admin-infos',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './infos.html',
})
export class AdminInfosComponent implements OnInit {
  readonly saving = signal(false);
  form: Partial<WeddingInfo> = {};

  constructor(private weddingInfoService: WeddingInfoService, private toast: ToastService) {}

  async ngOnInit(): Promise<void> {
    const info = await this.weddingInfoService.get();
    if (info) this.form = { ...info, date: info.date?.slice(0, 16) };
  }

  get dateLabelPreview(): string {
    return formatWeddingDateLabel(this.form.date) || 'Définissez la date et l\'heure ci-dessus';
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      this.form.dateLabel = formatWeddingDateLabel(this.form.date);
      await this.weddingInfoService.update(this.form);
      this.toast.show('Informations du mariage mises à jour. Le compte à rebours des invités est synchronisé.', 'success');
    } finally {
      this.saving.set(false);
    }
  }
}
