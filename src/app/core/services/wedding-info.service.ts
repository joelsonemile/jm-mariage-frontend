import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WeddingInfo } from '../models/wedding-info.model';

@Injectable({ providedIn: 'root' })
export class WeddingInfoService {
  constructor(private http: HttpClient) {}

  async get(): Promise<WeddingInfo | null> {
    const res = await firstValueFrom(
      this.http.get<{ data: { info: WeddingInfo | null } }>(`${environment.apiUrl}/wedding-info`)
    );
    return res.data.info;
  }

  async update(payload: Partial<WeddingInfo>): Promise<WeddingInfo> {
    const res = await firstValueFrom(
      this.http.put<{ data: { info: WeddingInfo } }>(`${environment.apiUrl}/wedding-info`, payload)
    );
    return res.data.info;
  }
}
