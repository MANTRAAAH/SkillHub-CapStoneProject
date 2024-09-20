import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isFreelancer = false;
  userRole: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserFromToken();
    this.userRole = this.authService.getRoleFromToken();

    if (this.userRole) {
      this.isFreelancer = this.userRole === 'Freelancer';
    } else {
    }
  }

  logout() {
    this.authService.logout();
  }
}
