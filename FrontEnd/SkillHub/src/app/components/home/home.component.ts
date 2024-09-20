import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { CategoryDto } from '../../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: any[] = [];
  responsiveOptions: any[];
  isAuthenticated: boolean = false;
  categories: any[] = [];

  constructor(private router:Router,private apiService: ApiService, private authService:AuthService,private categoryService: CategoryService) {
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
    this.loadCategories();
  }



  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: any) => {

        if (data && data.$values) {
          this.categories = data.$values;
        } else {
          this.categories = data;
        }
      },
      (error) => {
        console.error('Errore durante il caricamento delle categorie:', error);
      }
    );
  }


  navigateToServices(categoryName: string): void {

    this.router.navigate(['/services'], { queryParams: { category: categoryName } });
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
