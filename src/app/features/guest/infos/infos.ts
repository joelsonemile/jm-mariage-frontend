import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ProgramStep, WeddingInfo } from '../../../core/models/wedding-info.model';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';
import { IconComponent } from '../../../shared/components/icon/icon';

interface ProgramSubGroup {
  subProgram: string;
  steps: ProgramStep[];
}

interface ProgramGroup {
  section: string;
  subGroups: ProgramSubGroup[];
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

  // Regroupe le programme par "acte" (Journée / Soirée / ...) puis, à l'intérieur
  // de chaque acte, par BLOC CONSÉCUTIF de sous-programme (ex: "PROGRAMME - DINER
  // DE MARIAGE (20h45 - 22h00)") — les étapes sans sous-programme restent
  // directement dans l'acte. Le regroupement par sous-programme se fait par suite
  // consécutive (pas par fusion globale de la même clé) pour ne pas casser l'ordre
  // chronologique quand un bloc est inséré entre deux étapes "libres".
  readonly programGroups = computed<ProgramGroup[]>(() => {
    const groups: ProgramGroup[] = [];
    for (const step of this.info()?.programDetailed || []) {
      const sectionKey = step.section || '';
      let group = groups.find((g) => g.section === sectionKey);
      if (!group) {
        group = { section: sectionKey, subGroups: [] };
        groups.push(group);
      }
      const subKey = step.subProgram || '';
      const lastSubGroup = group.subGroups[group.subGroups.length - 1];
      if (lastSubGroup && lastSubGroup.subProgram === subKey) {
        lastSubGroup.steps.push(step);
      } else {
        group.subGroups.push({ subProgram: subKey, steps: [step] });
      }
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
