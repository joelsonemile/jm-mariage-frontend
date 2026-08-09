import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'close'
  | 'edit'
  | 'trash'
  | 'check'
  | 'gear'
  | 'download'
  | 'chevron-down'
  | 'chevron-right'
  | 'sparkle'
  | 'ring'
  | 'heart'
  | 'plane'
  | 'timer'
  | 'pin'
  | 'compass'
  | 'shirt'
  | 'calendar'
  | 'clock'
  | 'circle-dot'
  | 'crown'
  | 'warning'
  | 'log-out'
  | 'sun'
  | 'moon';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.html',
})
export class IconComponent {
  @Input() name: IconName = 'close';
}
