import { CategoryService } from './../../../services/category.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Service, Category, SubCategory, ServiceDto } from '../../../models/models';  // Importa le interfacce

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  services: ServiceDto[] = [];  // Usa l'interfaccia
  categories: Category[] = [];
  subCategories: SubCategory[] = [];

  filter:any = {
    category: '',
    subCategory: '',
    maxPrice: ''
  };

  filteredServices: ServiceDto[] = [];

  constructor(private apiService: ApiService, private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadServices();
    this.loadCategories();
    this.loadSubCategories();
  }

  loadServices() {
    this.apiService.getServices().subscribe(
      (data) => {
        // Verifica che esista la proprietà $values
        if (data && data.$values) {
          this.services = data.$values;
          this.filteredServices = this.services; // Mostra tutti i servizi inizialmente

          // Logga per assicurarti che i dati siano processati correttamente
          console.log('Servizi:', this.services);
        } else {
          console.error('Struttura dei dati non valida:', data);
        }
      },
      (error) => {
        console.error('Errore nel caricamento dei servizi', error);
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

    console.log('Servizi filtrati:', this.filteredServices);
  }




  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: any) => {  // Ricevi l'oggetto contenente $values
        if (data && data.$values) {
          this.categories = data.$values;  // Assegna l'array di categorie alla variabile
          console.log('Categorie caricate:', this.categories);
        } else {
          console.error('Struttura dei dati non valida:', data);
        }
      },
      (error) => {
        console.error('Errore nel caricamento delle categorie', error);
      }
    );
  }

  // Usa CategoryService per caricare le sottocategorie
  loadSubCategories(): void {
    this.categoryService.getSubcategories().subscribe(
      (data: any) => {
        // Accedi alla proprietà $values per ottenere l'array
        if (data && data.$values) {
          this.subCategories = data.$values;
          console.log('Sottocategorie:', this.subCategories);
        } else {
          console.error('Struttura dei dati non valida:', data);
        }
      },
      (error) => {
        console.error('Errore nel caricamento delle sottocategorie', error);
      }
    );
  }


}
