import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatWeddingDateLabel } from '../../../core/utils/date-format.util';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-code.html',
})
export class QrCodeComponent {
  @Input({ required: true }) dataUrl!: string;
  @Input() caption = 'Présentez ce QR à l\'entrée';
  @Input() tableName = '';
  @Input() seatNumber: number | null = null;
  @Input() coupleLabel = 'Joelson & Marjorie';
  @Input() weddingDate: string | Date | null = null;
  @Input() location = 'Agadir, Maroc';

  readonly downloading = signal(false);

  async download(): Promise<void> {
    if (this.downloading()) return;
    this.downloading.set(true);
    try {
      const ticketDataUrl = await this.composeTicketImage();
      const filename = this.buildFilename();
      this.triggerDownload(ticketDataUrl, filename);
    } catch {
      // Fallback: download the raw QR image if the composition fails.
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
    const parts = ['Ticket-JM'];
    if (this.tableName) parts.push(slug(this.tableName));
    if (this.seatNumber) parts.push(`Place${this.seatNumber}`);
    return `${parts.join('-')}.png`;
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

  private async composeTicketImage(): Promise<string> {
    const qrImg = await this.loadImage(this.dataUrl);
    const width = 640;
    const height = 920;
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

    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 20px Georgia, serif';
    const placeLabel = 'VOTRE PLACE';
    const placeLabelWidth = ctx.measureText(placeLabel).width;
    ctx.fillText(placeLabel, width / 2, 72);
    this.drawSparkle(ctx, width / 2 - placeLabelWidth / 2 - 20, 67, 6);
    this.drawSparkle(ctx, width / 2 + placeLabelWidth / 2 + 20, 67, 6);

    ctx.fillStyle = '#f5f5f5';
    ctx.font = '700 42px Georgia, serif';
    ctx.fillText(this.tableName || 'Table', width / 2, 130);

    if (this.seatNumber) {
      ctx.fillStyle = '#ffd700';
      ctx.font = '700 34px Georgia, serif';
      ctx.fillText(`Place #${this.seatNumber}`, width / 2, 182);
    }

    const qrSize = 380;
    const qrX = (width - qrSize) / 2;
    const qrY = 226;
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 18);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = '#a89f8e';
    ctx.font = '400 18px Georgia, serif';
    ctx.fillText(this.caption, width / 2, qrY + qrSize + 62);

    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(40, height - 118);
    ctx.lineTo(width - 40, height - 118);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#c9a84c';
    ctx.font = '600 24px Georgia, serif';
    ctx.fillText(`JM · ${this.coupleLabel}`, width / 2, height - 66);

    const dateLabel = formatWeddingDateLabel(this.weddingDate);
    ctx.fillStyle = '#6b6455';
    ctx.font = '400 15px Georgia, serif';
    ctx.fillText(dateLabel ? `${this.location} · ${dateLabel}` : this.location, width / 2, height - 36);

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
