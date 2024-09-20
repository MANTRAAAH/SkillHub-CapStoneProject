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
  isLoading: boolean = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Carica tutte le categorie esistenti
  loadCategories() {
    this.isLoading = true;  // Mostra lo spinner
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categories = data.$values ? data.$values : data;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  // Crea una nuova categoria
  onSubmitCategory() {
    if (this.categoryName.trim()) {
      const categoryData = {
        categoryName: this.categoryName
      };


      this.isLoading = true;
      this.categoryService.createCategory(categoryData).subscribe(
        (response) => {
          this.categorySuccessMessage = 'Categoria creata con successo!';
          this.categoryName = '';
          this.loadCategories();
        },
        (error) => {
          this.isLoading = false;
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



      this.isLoading = true;
      this.categoryService.createSubcategory(subcategoryData).subscribe(
        (response) => {
          this.subcategorySuccessMessage = 'Sottocategoria creata con successo!';
          this.subcategoryName = '';
          this.loadCategories();
        },
        (error) => {
          this.isLoading = false;
        }
      );
    }
  }
  // Elimina una categoria
  deleteCategory(categoryID: number) {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
      this.isLoading = true;
      this.categoryService.deleteCategory(categoryID).subscribe(
        () => {
          this.loadCategories();
        },
        (error) => {
          this.isLoading = false;
        }
      );
    }
  }

  // Elimina una sottocategoria
  deleteSubcategory(subCategoryID: number) {
    if (confirm('Sei sicuro di voler eliminare questa sottocategoria?')) {
      this.isLoading = true;
      this.categoryService.deleteSubcategory(subCategoryID).subscribe(
        () => {
          this.loadCategories();
        },
        (error) => {
          this.isLoading = false; 
        }
      );
    }
  }
}
