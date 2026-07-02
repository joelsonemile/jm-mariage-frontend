import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TableDetail, TableSummary } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TableService {
  constructor(private http: HttpClient) {}

  async list(): Promise<TableSummary[]> {
    const res = await firstValueFrom(
      this.http.get<{ data: { tables: TableSummary[] } }>(`${environment.apiUrl}/tables`)
    );
    return res.data.tables;
  }

  async get(id: string): Promise<TableDetail> {
    const res = await firstValueFrom(
      this.http.get<{ data: TableDetail }>(`${environment.apiUrl}/tables/${id}`)
    );
    return res.data;
  }
}
