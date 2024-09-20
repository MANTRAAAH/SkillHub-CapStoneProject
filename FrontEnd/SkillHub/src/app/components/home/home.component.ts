import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: any[] = [];
  responsiveOptions: any[];
  isAuthenticated: boolean = false;

  constructor(private apiService: ApiService, private authService:AuthService) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.loadRandomServices();
    this.isAuthenticated=this.authService.isAuthenticated();
  }

  loadRandomServices() {
    this.apiService.getRandomServices().subscribe(
      (data: any) => {

        if (data && data.$values) {
          this.services = data.$values;
        } else {
          this.services = data;
        }


      },
      (error) => {
        this.services = [];
      }
    );
  }
}
