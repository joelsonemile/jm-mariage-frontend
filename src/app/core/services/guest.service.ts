import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RsvpStatus, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class GuestService {
  constructor(private http: HttpClient) {}

  async updateProfile(payload: Partial<{ fullName: string; phone: string; linkToCouple: string }>, photo?: File) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => value && form.append(key, value));
    if (photo) form.append('profilePhoto', photo);

    const res = await firstValueFrom(
      this.http.put<{ data: { user: User } }>(`${environment.apiUrl}/guests/me`, form)
    );
    return res.data.user;
  }

  async updateRsvp(status: RsvpStatus) {
    const res = await firstValueFrom(
      this.http.put<{ data: { user: User } }>(`${environment.apiUrl}/guests/me/rsvp`, { status })
    );
    return res.data.user;
  }
}
