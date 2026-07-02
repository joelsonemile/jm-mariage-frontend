import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.html',
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input({ required: true }) targetDate!: string | Date;

  readonly timeLeft = signal<TimeLeft>({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private tick(): void {
    const target = new Date(this.targetDate).getTime();
    const diff = Math.max(0, target - Date.now());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    this.timeLeft.set({
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    });
  }
}
