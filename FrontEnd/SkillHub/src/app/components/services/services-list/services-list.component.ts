import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Service, Category, SubCategory } from '../../../models/models';  // Importa le interfacce

@Component({
  selector: 'app-services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent implements OnInit {
  services: Service[] = [];  // Usa l'interfaccia
  categories: Category[] = [];
  subCategories: SubCategory[] = [];

  filter:any = {
    category: '',
    subCategory: '',
    maxPrice: ''
  };

  filteredServices: Service[] = [];

  constructor(private apiService: ApiService) { }

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
      return (!this.filter.category || service.categoryName === this.filter.category) &&
             (!this.filter.subCategory || service.subCategoryName === this.filter.subCategory) &&
             (!this.filter.maxPrice || service.price <= this.filter.maxPrice);
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe(
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


  loadSubCategories(): void {
    this.apiService.getSubCategories().subscribe(
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
