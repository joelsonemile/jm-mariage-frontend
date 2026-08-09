import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';
import { TicketSeat } from '../../../core/models/reservation.model';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './qr-code.html',
})
export class QrCodeComponent {
  @Input({ required: true }) dataUrl!: string;
  @Input({ required: true }) guestName!: string;
  @Input({ required: true }) seats!: TicketSeat[];
  @Input() caption = "Présentez ce QR à l'entrée";
  @Input() coupleLabel = 'Joelson & Marjorie';
  @Input() weddingDate: string | Date | null = null;
  @Input() location = 'Agadir, Maroc';

  readonly downloading = signal(false);

  get uniqueTableNames(): string[] {
    return Array.from(new Set(this.seats.map((s) => s.tableName)));
  }

  async download(): Promise<void> {
    if (this.downloading()) return;
    this.downloading.set(true);
    try {
      const ticketDataUrl = await this.composeTicketImage();
      this.triggerDownload(ticketDataUrl, this.buildFilename());
    } catch {
      // Repli : télécharger le QR brut si la composition échoue.
      this.triggerDownload(this.dataUrl, this.buildFilename());
    } finally {
      this.downloading.set(false);
    }
  }

  private buildFilename(): string {
    const slug = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    return `Ticket-JM-${slug(this.guestName || 'invite')}.png`;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Dessine un petit repère "sparkle" vectoriel plutôt qu'un glyphe emoji, dont
  // le rendu dépend de la police système et varie selon les appareils.
  private drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    const outer = size;
    const inner = size * 0.32;
    const points: [number, number][] = [
      [cx, cy - outer],
      [cx + inner, cy - inner],
      [cx + outer, cy],
      [cx + inner, cy + inner],
      [cx, cy + outer],
      [cx - inner, cy + inner],
      [cx - outer, cy],
      [cx - inner, cy - inner],
    ];
    ctx.beginPath();
    points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
  }

  private drawPlane(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number): void {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    ctx.moveTo(22, 2);
    ctx.lineTo(11, 13);
    ctx.moveTo(22, 2);
    ctx.lineTo(15, 22);
    ctx.lineTo(11, 13);
    ctx.lineTo(2, 9);
    ctx.lineTo(22, 2);
    ctx.stroke();
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Ligne de séparation façon souche de billet : pointillés + deux encoches
  // rondes réellement transparentes (découpées, pas juste peintes en gris).
  private drawPerforation(ctx: CanvasRenderingContext2D, y: number, width: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(201,168,76,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 30, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(0, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private async composeTicketImage(): Promise<string> {
    const qrImg = await this.loadImage(this.dataUrl);
    const width = 640;
    const seatsCount = this.seats.length;
    const seatsBlockHeight = 56 + seatsCount * 40;
    const height = 560 + seatsBlockHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unsupported');

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#161410');
    bgGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = bgGrad;
    this.roundRect(ctx, 0, 0, width, height, 32);
    ctx.fill();

    ctx.strokeStyle = 'rgba(201,168,76,0.55)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, 6, 6, width - 12, height - 12, 28);
    ctx.stroke();

    ctx.textAlign = 'center';

    // Bandeau "carte d'embarquement" : l'icône avion est positionnée à partir
    // de la largeur mesurée du texte pour ne jamais le chevaucher.
    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 15px Georgia, serif';
    const bandLabel = "CARTE D'EMBARQUEMENT";
    const bandLabelWidth = ctx.measureText(bandLabel).width;
    ctx.fillText(bandLabel, width / 2 + 12, 67);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawPlane(ctx, width / 2 - bandLabelWidth / 2 - 22, 63, 14);

    ctx.fillStyle = '#a89f8e';
    ctx.font = '400 14px Georgia, serif';
    ctx.fillText(`JM · ${this.coupleLabel}`, width / 2, 92);

    // Passager
    ctx.fillStyle = '#8a8175';
    ctx.font = '600 12px Georgia, serif';
    ctx.fillText('PASSAGER', width / 2, 138);
    ctx.fillStyle = '#f5f5f5';
    ctx.font = '700 30px Georgia, serif';
    ctx.fillText(this.guestName || 'Invité', width / 2, 174);

    let cursorY = 174;
    const tableNames = this.uniqueTableNames;
    if (tableNames.length === 1) {
      cursorY += 46;
      ctx.fillStyle = '#8a8175';
      ctx.font = '600 12px Georgia, serif';
      ctx.fillText('TABLE', width / 2, cursorY);
      cursorY += 38;
      ctx.fillStyle = '#ffd700';
      ctx.font = '700 34px Georgia, serif';
      ctx.fillText(tableNames[0], width / 2, cursorY);
      cursorY += 30;
    } else {
      cursorY += 30;
    }

    this.drawPerforation(ctx, cursorY, width);
    cursorY += 40;

    ctx.fillStyle = '#8a8175';
    ctx.font = '600 12px Georgia, serif';
    ctx.fillText(seatsCount > 1 ? 'PLACES' : 'PLACE', width / 2, cursorY);
    cursorY += 30;

    for (const seat of this.seats) {
      const label = tableNames.length > 1 ? `${seat.tableName} · Place #${seat.seatNumber}` : `Place #${seat.seatNumber}`;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f5f5f5';
      ctx.font = '700 18px Georgia, serif';
      ctx.fillText(label, 60, cursorY);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#c9bfae';
      ctx.font = '400 16px Georgia, serif';
      ctx.fillText(seat.companionName || '—', width - 60, cursorY);
      ctx.textAlign = 'center';
      cursorY += 40;
    }

    cursorY += 10;
    this.drawPerforation(ctx, cursorY, width);
    cursorY += 40;

    const qrSize = 320;
    const qrX = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, qrX - 16, cursorY, qrSize + 32, qrSize + 32, 18);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, cursorY + 16, qrSize, qrSize);
    cursorY += qrSize + 32 + 36;

    ctx.fillStyle = '#a89f8e';
    ctx.font = '400 16px Georgia, serif';
    const placeLabel = this.caption;
    const placeLabelWidth = ctx.measureText(placeLabel).width;
    ctx.fillText(placeLabel, width / 2, cursorY);
    this.drawSparkle(ctx, width / 2 - placeLabelWidth / 2 - 18, cursorY - 5, 5);
    this.drawSparkle(ctx, width / 2 + placeLabelWidth / 2 + 18, cursorY - 5, 5);
    cursorY += 36;

    const dateLabel = formatWeddingDateLabel(this.weddingDate);
    ctx.fillStyle = '#6b6455';
    ctx.font = '400 14px Georgia, serif';
    ctx.fillText(dateLabel ? `${this.location} · ${dateLabel}` : this.location, width / 2, cursorY);

    return canvas.toDataURL('image/png');
  }

  private triggerDownload(dataUrl: string, filename: string): void {
    const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      const win = window.open();
      if (win) {
        win.document.title = filename;
        win.document.body.style.margin = '0';
        win.document.body.style.background = '#0a0a0a';
        win.document.body.style.display = 'flex';
        win.document.body.style.alignItems = 'center';
        win.document.body.style.justifyContent = 'center';
        win.document.body.style.minHeight = '100vh';
        const img = win.document.createElement('img');
        img.src = dataUrl;
        img.style.width = '100%';
        img.style.height = 'auto';
        win.document.body.appendChild(img);
      } else {
        window.location.href = dataUrl;
      }
      return;
    }

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
