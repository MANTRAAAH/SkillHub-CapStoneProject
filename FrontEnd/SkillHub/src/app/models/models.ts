export interface Service {
userName: any;
  serviceID: number;
  title: string;
  categoryName: string;
  subCategoryName: string;
  price: number;
}

export interface Category {
  id: number;
  categoryName: string;
}

export interface SubCategory {
  id: number;
  subCategoryName: string;
  categoryId: number;  // Collegamento alla categoria
}
