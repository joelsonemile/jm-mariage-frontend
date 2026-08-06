import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProgramStep, WeddingInfo } from '../models/wedding-info.model';

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

  async addProgramStep(step: Partial<ProgramStep>): Promise<WeddingInfo> {
    const res = await firstValueFrom(
      this.http.post<{ data: { info: WeddingInfo } }>(`${environment.apiUrl}/wedding-info/program`, step)
    );
    return res.data.info;
  }

  async updateProgramStep(stepId: string, step: Partial<ProgramStep>): Promise<WeddingInfo> {
    const res = await firstValueFrom(
      this.http.put<{ data: { info: WeddingInfo } }>(`${environment.apiUrl}/wedding-info/program/${stepId}`, step)
    );
    return res.data.info;
  }

  async deleteProgramStep(stepId: string): Promise<WeddingInfo> {
    const res = await firstValueFrom(
      this.http.delete<{ data: { info: WeddingInfo } }>(`${environment.apiUrl}/wedding-info/program/${stepId}`)
    );
    return res.data.info;
  }

  async exportProgramPdf(): Promise<Blob> {
    return firstValueFrom(this.http.get(`${environment.apiUrl}/wedding-info/program/pdf`, { responseType: 'blob' }));
  }
}
