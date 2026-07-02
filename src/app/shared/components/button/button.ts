import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = true;
  @Output() clicked = new EventEmitter<void>();

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-sm px-6 py-3.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
    const width = this.fullWidth ? 'w-full' : '';
    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-b from-[var(--color-gold-bright)] to-[var(--color-gold)] text-black shadow-[0_0_0_rgba(255,215,0,0)] hover:shadow-[0_0_20px_rgba(255,215,0,0.35)]',
      outline:
        'bg-transparent border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10',
      ghost: 'bg-[var(--color-surface)] text-[var(--color-text-soft)] hover:bg-[var(--color-surface-alt)]',
      danger: 'bg-transparent border border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10',
    };
    return `${base} ${width} ${variants[this.variant]}`;
  }
}
