import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ProgramStep, WeddingInfo } from '../../../core/models/wedding-info.model';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';
import { IconComponent } from '../../../shared/components/icon/icon';

interface ProgramGroup {
  section: string;
  steps: ProgramStep[];
}

@Component({
  selector: 'app-guest-infos',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './infos.html',
})
export class GuestInfosComponent implements OnInit {
  readonly info = signal<WeddingInfo | null>(null);
  readonly downloadingPdf = signal(false);

  // Regroupe le programme par "acte" (Journée / Soirée / ...) dans leur ordre
  // d'apparition, pour un affichage en deux temps plutôt qu'une liste plate.
  readonly programGroups = computed<ProgramGroup[]>(() => {
    const groups: ProgramGroup[] = [];
    for (const step of this.info()?.programDetailed || []) {
      const key = step.section || '';
      let group = groups.find((g) => g.section === key);
      if (!group) {
        group = { section: key, steps: [] };
        groups.push(group);
      }
      group.steps.push(step);
    }
    return groups;
  });

  constructor(private weddingInfoService: WeddingInfoService) {}

  async ngOnInit(): Promise<void> {
    this.info.set(await this.weddingInfoService.get());
  }

  isEvening(section: string): boolean {
    return /soir/i.test(section);
  }

  dateLabel(info: WeddingInfo): string {
    return formatWeddingDateLabel(info.date) || info.dateLabel;
  }

  async downloadPdf(): Promise<void> {
    this.downloadingPdf.set(true);
    try {
      const blob = await this.weddingInfoService.exportProgramPdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'programme-jm-mariage.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.downloadingPdf.set(false);
    }
  }
}
