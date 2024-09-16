import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss']
})
export class CategoryManagementComponent implements OnInit {
  categoryName: string = '';
  subcategoryName: string = '';
  categories: any[] = [];
  selectedCategoryId: number | null = null;
  categorySuccessMessage: string = '';
  categoryErrorMessage: string = '';
  subcategorySuccessMessage: string = '';
  subcategoryErrorMessage: string = '';
  isLoading: boolean = false;  // Variabile per lo spinner

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Carica tutte le categorie esistenti
  loadCategories() {
    this.isLoading = true;  // Mostra lo spinner
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        console.log('Categories data received:', data); // Log the received data to inspect its structure
        this.categories = data.$values ? data.$values : data;
        this.isLoading = false;  // Nascondi lo spinner
      },
      (error) => {
        console.error('Errore nel caricamento delle categorie:', error);
        this.isLoading = false;  // Nascondi lo spinner anche in caso di errore
      }
    );
  }

  // Crea una nuova categoria
  onSubmitCategory() {
    if (this.categoryName.trim()) {
      const categoryData = {
        categoryName: this.categoryName
      };

      console.log('Dati inviati:', categoryData); // Log dei dati

      this.isLoading = true;  // Mostra lo spinner durante l'aggiunta
      this.categoryService.createCategory(categoryData).subscribe(
        (response) => {
          console.log('Categoria creata con successo:', response);
          this.categorySuccessMessage = 'Categoria creata con successo!';
          this.categoryName = ''; // Resetta il campo input
          this.loadCategories(); // Ricarica le categorie aggiornate
        },
        (error) => {
          console.error('Errore nella creazione della categoria:', error);
          this.isLoading = false;  // Nascondi lo spinner in caso di errore
        }
      );
    }
  }

  // Crea una nuova sottocategoria
  onSubmitSubcategory() {
    if (this.subcategoryName.trim() && this.selectedCategoryId) {
      const subcategoryData = {
        subCategoryName: this.subcategoryName,
        categoryID: this.selectedCategoryId
      };

      console.log('Dati sottocategoria inviati:', subcategoryData);

      this.isLoading = true;  // Mostra lo spinner durante l'aggiunta
      this.categoryService.createSubcategory(subcategoryData).subscribe(
        (response) => {
          console.log('Sottocategoria creata con successo:', response);
          this.subcategorySuccessMessage = 'Sottocategoria creata con successo!';
          this.subcategoryName = ''; // Resetta il campo input
          this.loadCategories(); // Ricarica le categorie aggiornate
        },
        (error) => {
          console.error('Errore nella creazione della sottocategoria:', error);
          this.isLoading = false;  // Nascondi lo spinner in caso di errore
        }
      );
    }
  }
  // Elimina una categoria
  deleteCategory(categoryID: number) {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      this.isLoading = true;  // Mostra lo spinner durante l'eliminazione
      this.categoryService.deleteCategory(categoryID).subscribe(
        () => {
          console.log('Categoria eliminata con successo');
          this.loadCategories(); // Ricarica le categorie aggiornate
        },
        (error) => {
          console.error('Errore nell\'eliminazione della categoria:', error);
          this.isLoading = false;  // Nascondi lo spinner in caso di errore
        }
      );
    }
  }

  // Elimina una sottocategoria
  deleteSubcategory(subCategoryID: number) {
    if (confirm('Sei sicuro di voler eliminare questa sottocategoria?')) {
      this.isLoading = true;  // Mostra lo spinner durante l'eliminazione
      this.categoryService.deleteSubcategory(subCategoryID).subscribe(
        () => {
          console.log('Sottocategoria eliminata con successo');
          this.loadCategories(); // Ricarica le categorie aggiornate
        },
        (error) => {
          console.error('Errore nell\'eliminazione della sottocategoria:', error);
          this.isLoading = false;  // Nascondi lo spinner in caso di errore
        }
      );
    }
  }
}
