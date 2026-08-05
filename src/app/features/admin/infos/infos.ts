import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeddingInfoService } from '../../../core/services/wedding-info.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProgramStep, WeddingInfo } from '../../../core/models/wedding-info.model';
import { ButtonComponent } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';

@Component({
  selector: 'app-admin-infos',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, IconComponent],
  templateUrl: './infos.html',
})
export class AdminInfosComponent implements OnInit {
  readonly saving = signal(false);
  form: Partial<WeddingInfo> = {};

  readonly steps = signal<ProgramStep[]>([]);
  readonly editingStepId = signal<string | null>(null);
  readonly savingStepId = signal<string | null>(null);
  stepDraft: Partial<ProgramStep> = { time: '', title: '', description: '' };

  constructor(
    private weddingInfoService: WeddingInfoService,
    private toast: ToastService,
    private cd: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const info = await this.weddingInfoService.get();
    if (info) this.form = { ...info, date: info.date?.slice(0, 16) };
    this.steps.set(this.form.programDetailed || []);
    // L'app tourne sans zone.js : une mutation de propriété après un `await` ne
    // planifie pas de détection de changements toute seule, contrairement à un
    // événement DOM ou une écriture de signal — on la déclenche donc manuellement.
    this.cd.detectChanges();
  }

  get dateLabelPreview(): string {
    return formatWeddingDateLabel(this.form.date) || 'Définissez la date et l\'heure ci-dessus';
  }

  // Chaque étape du programme est persistée immédiatement (CRUD dédié), séparément
  // du bouton "Enregistrer" global qui ne couvre que le reste du formulaire.
  async addStep(): Promise<void> {
    const info = await this.weddingInfoService.addProgramStep({ time: '', title: '', description: '' });
    this.steps.set(info.programDetailed);
    const created = info.programDetailed[info.programDetailed.length - 1];
    this.startEdit(created);
  }

  startEdit(step: ProgramStep): void {
    this.editingStepId.set(step._id);
    this.stepDraft = { time: step.time, title: step.title, description: step.description };
  }

  async saveStep(): Promise<void> {
    const stepId = this.editingStepId();
    if (!stepId) return;
    this.savingStepId.set(stepId);
    try {
      const info = await this.weddingInfoService.updateProgramStep(stepId, this.stepDraft);
      this.steps.set(info.programDetailed);
      this.editingStepId.set(null);
      this.toast.show('Étape du programme enregistrée.', 'success');
    } finally {
      this.savingStepId.set(null);
    }
  }

  async removeStep(step: ProgramStep): Promise<void> {
    const info = await this.weddingInfoService.deleteProgramStep(step._id);
    this.steps.set(info.programDetailed);
    if (this.editingStepId() === step._id) this.editingStepId.set(null);
    this.toast.show('Étape du programme supprimée.', 'success');
  }

  trackById(_: number, step: ProgramStep): string {
    return step._id;
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      this.form.dateLabel = formatWeddingDateLabel(this.form.date);
      const { programDetailed, ...rest } = this.form;
      await this.weddingInfoService.update(rest);
      this.toast.show('Informations du mariage mises à jour. Le compte à rebours des invités est synchronisé.', 'success');
    } finally {
      this.saving.set(false);
    }
  }
}
