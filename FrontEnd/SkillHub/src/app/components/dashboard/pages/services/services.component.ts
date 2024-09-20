import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { CategoryService } from '../../../../services/category.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { AuthService } from '../../../../services/auth.service';
import { ServiceDto, CategoryDto, SubCategoryDto } from '../../../../models/models';  // Usa i nuovi DTO

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: ServiceDto[] = [];
  isLoading = true;
  errorMessage = '';
  searchTerm = '';
  categories: CategoryDto[] = [];
  subCategories: SubCategoryDto[] = [];
  filteredSubCategories: SubCategoryDto[] = [];
  isRefreshing = false;

  selectedService: ServiceDto | null = null;
  isEditing = false;
  currentService: ServiceDto = this.resetService();
  selectedFile: File | null = null;  // Aggiungi il supporto per i file caricati

  constructor(private apiService: ApiService, private authService: AuthService, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadUserServices();
    this.loadCategories();
    this.loadSubCategories();
  }

  loadUserServices() {
    this.apiService.getUserServices().subscribe(
      (data: any) => {
        console.log('Servizi ricevuti dal server:', data);

        this.isLoading = false;
        this.services = data?.$values || data || [];

        if (this.services.length === 0) {
          this.errorMessage = 'Nessun servizio disponibile.';
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'Errore nel caricamento dei servizi.';
        console.error('Errore nel caricamento dei servizi', error);
      }
    );
  }

  resetService(): ServiceDto {
    return {
      serviceID: 0,
      UserID: 0,
      title: '',
      description: '',
      price: 0,
      categoryId: 0,
      subCategoryId: 0,
      userName: '',
      imagePath: ''  // Aggiungi l'url per l'immagine
    };
  }

  // Funzione per gestire la selezione del file
  onFileSelected(event: any) {
    if (event && event.files && event.files.length > 0) {
      this.selectedFile = event.files[0];  // Memorizza il primo file selezionato
    } else {
    }
  }

  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      this.apiService.uploadImage(formData).subscribe(
        (response) => {
          this.currentService.imagePath = response.imagePath; // Salva il percorso dell'immagine
        },
        (error) => {
        }
      );
    } else {
    }
  }




  // Funzione per aggiungere un servizio con immagine
  addService() {
    this.isRefreshing = true;
    this.currentService.UserID = Number(this.authService.getUserId()) ?? 0;

    const formData = new FormData();
    formData.append('title', this.currentService.title);
    formData.append('description', this.currentService.description);
    formData.append('price', this.currentService.price.toString());
    formData.append('categoryId', this.currentService.categoryId.toString());
    formData.append('subCategoryId', this.currentService.subCategoryId.toString());
    formData.append('UserID', this.currentService.UserID.toString());
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);  // Aggiungi l'immagine solo se presente
    }

    this.apiService.createService(formData).subscribe(
      (createdService: ServiceDto) => {
        this.services.push(createdService);
        this.currentService = this.resetService();
        this.selectedFile = null;

        setTimeout(() => {
          this.isRefreshing = false;
          location.reload();
        }, 1500);
      },
      (error: any) => {
        this.isRefreshing = false;
      }
    );
  }

  // Funzione per aggiornare un servizio con immagine
  updateService() {
    if (!this.currentService || typeof this.currentService.serviceID !== 'number') {
      return;
    }

    const userId = this.authService.getUserId();
    if (userId && !isNaN(Number(userId))) {
      this.currentService.UserID = Number(userId);
    } else {
      return;
    }

    const formData = new FormData();
formData.append('ServiceID', this.currentService.serviceID.toString());
formData.append('UserID', this.currentService.UserID.toString());
formData.append('Title', this.currentService.title);
formData.append('Description', this.currentService.description);
formData.append('Price', this.currentService.price.toString());
formData.append('CategoryID', this.currentService.categoryId.toString());
formData.append('SubCategoryID', this.currentService.subCategoryId.toString());

// Aggiungi l'immagine solo se presente
if (this.selectedFile) {
  formData.append('image', this.selectedFile);
}


    this.isRefreshing = true;

    this.apiService.updateService(this.currentService.serviceID, formData).subscribe(
      (updatedService) => {
        const index = this.services.findIndex(s => s.serviceID === this.currentService.serviceID);
        if (index !== -1) {
          this.services[index] = { ...updatedService };
        }
        this.isEditing = false;
        this.currentService = this.resetService();
        this.selectedFile = null;

        setTimeout(() => {
          this.isRefreshing = false;
          location.reload();
        }, 1500);
      },
      (error: any) => {
        this.isRefreshing = false;
      }
    );
  }

  deleteService(serviceID: number) {
    if (confirm('Sei sicuro di voler eliminare questo servizio?')) {
      this.apiService.deleteService(serviceID).subscribe(
        () => {
          this.services = this.services.filter(s => s.serviceID !== serviceID);
        },
        (error: any) => {
        }
      );
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categories = data?.$values || data || [];
      },
      (error: any) => {
      }
    );
  }

  loadSubCategories() {
    this.categoryService.getSubcategories().subscribe(
      (data: any) => {
        this.subCategories = data?.$values || data || [];
      },
      (error: any) => {
      }
    );
  }

  onCategoryChange(eventOrCategoryId: Event | number) {
    let categoryId: number;

    if (typeof eventOrCategoryId === 'number') {
      categoryId = eventOrCategoryId;
    } else {
      const target = eventOrCategoryId.target as HTMLSelectElement;
      categoryId = parseInt(target.value, 10);
    }

    this.currentService.categoryId = categoryId;

    this.filteredSubCategories = this.subCategories.filter(
      subCategory => subCategory.categoryID === categoryId
    );
  }

  getCategoryNameById(categoryId: number): string | undefined {
    const category = this.categories.find(cat => cat.categoryID === categoryId);
    return category?.categoryName || 'Categoria non trovata';
  }

  getSubCategoryNameById(subCategoryId: number): string | undefined {
    const subCategory = this.subCategories.find(sub => sub.subCategoryID === subCategoryId);
    return subCategory?.subCategoryName || 'Sottocategoria non trovata';
  }

  cancelEdit() {
    this.isEditing = false;
    this.currentService = this.resetService();
  }

  editService(service: ServiceDto) {
    this.currentService = { ...service };
    this.isEditing = true;
    this.onCategoryChange(this.currentService.categoryId);
  }

  filteredServices() {
    if (!this.searchTerm) {
      return this.services;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    return this.services.filter(service =>
      service.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
      this.getCategoryNameById(service.categoryId)?.toLowerCase().includes(lowerCaseSearchTerm) ||
      this.getSubCategoryNameById(service.subCategoryId)?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
