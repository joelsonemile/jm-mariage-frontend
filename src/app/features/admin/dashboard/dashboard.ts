import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, AdminDashboardStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class AdminDashboardComponent implements OnInit {
  readonly stats = signal<AdminDashboardStats | null>(null);

  constructor(private adminService: AdminService) {}

  async ngOnInit(): Promise<void> {
    this.stats.set(await this.adminService.dashboard());
  }
}
