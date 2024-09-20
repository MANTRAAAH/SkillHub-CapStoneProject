import { CategoryService } from './../../../services/category.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute,Router } from '@angular/router';
import { Service, Category, SubCategory, ServiceDto } from '../../../models/models';  // Importa le interfacce

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  services: ServiceDto[] = [];
  categories: Category[] = [];
  subCategories: SubCategory[] = [];
  selectedCategory: string | null = null;


  filter:any = {
    category: '',
    subCategory: '',
    maxPrice: ''
  };

  filteredServices: ServiceDto[] = [];

  constructor(private apiService: ApiService, private categoryService: CategoryService,private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.loadServices();
    this.loadCategories();
    this.loadSubCategories();
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || null;
      this.loadServices();
    });
  }

  loadServices(): void {
    this.apiService.getServices().subscribe(
      (data) => {

        if (data && data.$values) {
          this.services = data.$values;
        } else {
          this.services = data;
        }


        if (this.selectedCategory) {
          this.filteredServices = this.services.filter(service => service.categoryName === this.selectedCategory);
        } else {
          this.filteredServices = this.services;
        }
      },
      (error) => {
        console.error('Errore durante il caricamento dei servizi:', error);
      }
    );
  }







  applyFilters() {
    this.filteredServices = this.services.filter(service => {
      const categoryFilterMatch = !this.filter.category || service.categoryId === this.filter.category.categoryID;
      const subCategoryFilterMatch = !this.filter.subCategory || service.subCategoryId === this.filter.subCategory.subCategoryID;
      const maxPriceFilterMatch = !this.filter.maxPrice || service.price <= this.filter.maxPrice;

      return categoryFilterMatch && subCategoryFilterMatch && maxPriceFilterMatch;
    });

  }
  resetFilters(): void {
    this.filter = {
      category: '',
      subCategory: '',
      maxPrice: ''
    };
    this.applyFilters();
  }





  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        if (data && data.$values) {
          this.categories = data.$values;
        } else {
        }
      },
      (error) => {
      }
    );
  }

  // Usa CategoryService per caricare le sottocategorie
  loadSubCategories(): void {
    this.categoryService.getSubcategories().subscribe(
      (data: any) => {

        if (data && data.$values) {
          this.subCategories = data.$values;
        } else {
        }
      },
      (error) => {
      }
    );
  }


}
