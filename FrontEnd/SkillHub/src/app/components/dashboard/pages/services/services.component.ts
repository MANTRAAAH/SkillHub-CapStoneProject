import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';
import { ServiceDto, CategoryDto, SubCategoryDto } from '../../../../models/models';  // Usa i nuovi DTO

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  services: ServiceDto[] = [];
  isLoading = true; // Stato di caricamento
  errorMessage = ''; // Messaggio di errore
  searchTerm = ''; // Campo di ricerca
  categories: CategoryDto[] = [];  // Usa la nuova struttura di CategoryDto
  subCategories: SubCategoryDto[] = [];  // Usa la nuova struttura di SubCategoryDto
  filteredSubCategories: SubCategoryDto[] = [];  // Sottocategorie filtrate in base alla categoria selezionata
  isRefreshing = false; // Nuovo stato per il refresh

  selectedService: ServiceDto | null = null;
  isEditing = false; // Stato per la modifica
  currentService: ServiceDto = this.resetService(); // Stato per il servizio corrente

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserServices();
    this.loadCategories();  // Carica le categorie con le sottocategorie
    this.loadSubCategories();
    this.subCategories = []; // Assicurati che sia un array vuoto all'inizio

  }

  loadUserServices() {
    this.apiService.getUserServices().subscribe(
      (data: any) => {
        this.isLoading = false;
        this.services = data?.$values || data || [];
        console.log('Servizi caricati:', this.services);

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
      userName: ''
    };
  }

  addService() {
    this.isRefreshing = true;  // Mostra lo spinner
    this.currentService.UserID = Number(this.authService.getUserId()) ?? 0;

    this.apiService.createService(this.currentService).subscribe(
      (createdService: ServiceDto) => {
        this.services.push(createdService);
        this.currentService = this.resetService();

        // Timeout per simulare il tempo di caricamento e nascondere lo spinner
        setTimeout(() => {
          this.isRefreshing = false;  // Nascondi lo spinner dopo 1.5 secondi
          location.reload();  // Ricarica la pagina
        }, 1500);
      },
      (error: any) => {
        console.error('Errore durante la creazione del servizio', error);
        this.isRefreshing = false;  // Nascondi lo spinner in caso di errore
      }
    );
  }


  editService(service: ServiceDto) {
    this.currentService = { ...service };
    this.isEditing = true;
    this.onCategoryChange(this.currentService.categoryId);
  }

  updateService() {
    // Controlla che il servizio attuale esista e che l'ID sia di tipo number
    if (!this.currentService || typeof this.currentService.serviceID !== 'number') {
      console.error('ID del servizio non disponibile o non è un numero');
      return;
    }

    // Estrai l'ID utente come numero
    const userId = this.authService.getUserId();
    if (userId && !isNaN(Number(userId))) {
      this.currentService.UserID = Number(userId);  // Converte userId in numero
    } else {
      console.error('UserID non valido o non trovato.');
      return;
    }

    // Verifica che categoryId e subCategoryId siano definiti e siano numeri
    if (typeof this.currentService.categoryId !== 'number') {
      this.currentService.categoryId = Number(this.currentService.categoryId);  // Converti in numero
    }

    if (typeof this.currentService.subCategoryId !== 'number') {
      this.currentService.subCategoryId = Number(this.currentService.subCategoryId);  // Converti in numero
    }

    if (isNaN(this.currentService.categoryId) || isNaN(this.currentService.subCategoryId)) {
      console.error('Categoria o sottocategoria non sono numeri validi', this.currentService.categoryId, this.currentService.subCategoryId);
      return;
    }

    // Mostra lo spinner per il refresh
    this.isRefreshing = true;

    // Chiamata API per aggiornare il servizio
    this.apiService.updateService(this.currentService.serviceID, this.currentService).subscribe(
      (updatedService) => {
        console.log('Servizio aggiornato:', updatedService);
        const index = this.services.findIndex(s => s.serviceID === this.currentService.serviceID);
        if (index !== -1) {
          this.services[index] = { ...updatedService };  // Aggiorna la lista dei servizi con il servizio aggiornato
        }
        this.isEditing = false;
        this.currentService = this.resetService();  // Resetta il form

        // Attiva il refresh dopo 1.5 secondi
        setTimeout(() => {
          this.isRefreshing = false; // Nascondi lo spinner
          location.reload(); // Effettua il refresh della pagina
        }, 1500); // 1.5 secondi
      },
      (error: any) => {
        console.error('Errore durante l\'aggiornamento del servizio', error);
        this.isRefreshing = false; // Nascondi lo spinner in caso di errore
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
          console.error('Errore durante l\'eliminazione del servizio', error);
        }
      );
    }
  }

  loadCategories() {
    this.apiService.getCategories().subscribe(
      (data: any) => {
        this.categories = data?.$values || data || [];
        console.log('Categorie caricate:', this.categories);
      },
      (error: any) => {
        console.error('Errore nel caricamento delle categorie', error);
      }
    );
  }

  loadSubCategories() {
    this.apiService.getSubCategories().subscribe(
      (data: any) => {
        this.subCategories = data?.$values || data || [];
        console.log('Sottocategorie caricate:', this.subCategories);  // Debug del caricamento delle sottocategorie
      },
      (error: any) => {
        console.error('Errore nel caricamento delle sottocategorie', error);
      }
    );
  }




  onCategoryChange(eventOrCategoryId: Event | number) {
    let categoryId: number;

    // Controlla se l'evento è un numero o un evento HTML
    if (typeof eventOrCategoryId === 'number') {
      categoryId = eventOrCategoryId;  // Se è già un numero, assegnalo direttamente
    } else {
      const target = eventOrCategoryId.target as HTMLSelectElement;
      categoryId = parseInt(target.value, 10);  // Converte il valore dell'evento in numero
    }

    this.currentService.categoryId = categoryId;  // Imposta il categoryId nel servizio corrente

    // Filtra le sottocategorie in base al categoryId selezionato
    this.filteredSubCategories = this.subCategories.filter(
      subCategory => subCategory.categoryID === categoryId
    );

    // Debugging per vedere le categorie e le sottocategorie filtrate
    console.log('Categorie:', this.categories);
    console.log('Sottocategorie per categoria selezionata:', this.filteredSubCategories);
  }










  getCategoryNameById(categoryId: number): string | undefined {
    if (!categoryId) {
        console.error('Categoria ID è indefinito o nullo');
        return 'Categoria non trovata';
    }

    // Log per il debugging
    console.log('Categorie disponibili:', this.categories);
    console.log('Ricerca della categoria con ID:', categoryId);

    // Modifica qui il nome della proprietà
    const category = this.categories.find(cat => cat.categoryID === categoryId);
    if (!category) {
        console.error('Categoria non trovata per ID:', categoryId);
        return 'Categoria non trovata';
    }

    return category.categoryName;  // Modifica anche qui
}


getSubCategoryNameById(subCategoryId: number): string | undefined {
  if (!Array.isArray(this.subCategories)) {
    console.error('Sottocategorie non è un array:', this.subCategories);
    return 'Sottocategoria non trovata';
  }

  const subCategory = this.subCategories.find(sub => sub.subCategoryID === subCategoryId);

  if (!subCategory) {
    console.error('Sottocategoria non trovata per ID:', subCategoryId);
    return 'Sottocategoria non trovata';
  }

  return subCategory.subCategoryName;
}



  cancelEdit() {
    this.isEditing = false;
    this.currentService = this.resetService();
  }

  filteredServices() {
    if (!this.searchTerm) {
      return this.services;
    }

    const lowerCaseSearchTerm = this.searchTerm.toLowerCase();

    return this.services.filter(service =>
      (service.title?.toLowerCase().includes(lowerCaseSearchTerm) || '') ||
      (this.getCategoryNameById(service.categoryId)?.toLowerCase().includes(lowerCaseSearchTerm) || '') ||
      (this.getSubCategoryNameById(service.subCategoryId)?.toLowerCase().includes(lowerCaseSearchTerm) || '')
    );
  }
}
