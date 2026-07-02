import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
})
export class ModalComponent {
  @Input() open = false;
  @Input() heading = '';
  @Input() closable = true;
  @Output() closed = new EventEmitter<void>();

  onBackdropClick(): void {
    if (this.closable) this.closed.emit();
  }
}
