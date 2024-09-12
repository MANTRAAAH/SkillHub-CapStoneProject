export interface User {
  userID: number;
  username: string;
  email: string;
  bio?: string;           // Campo opzionale
  profilePicture?: string; // Campo opzionale
}

export interface Message {
  messageID: number;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  content: string;  // Assicurati che questa proprietà esista
  timestamp: Date;
}



export interface Service {
description: any;
userName: any;
  serviceID: number;
  title: string;
  categoryName: string;
  subCategoryName: string;
  price: number;
}


export interface Order {
  orderID: number;
  serviceID: number;
  clientID: number;
  freelancerID: number;
  orderDate: Date;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  service: {
    title: string;
    description: string;
    price: number;
  };
  client: {
    username: string;
  };
  freelancer: {
    username: string;
  };
}

export interface OrderDetailsDto {
  orderID: number;
  serviceTitle: string;
  clientUsername: string;
  freelancerUsername: string;
  orderDate: Date;
  totalPrice: number;
  paymentStatus: string;
}

export interface ServiceDto {
  serviceID: number;
  UserID: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;  // ID della categoria
  subCategoryId: number;  // ID della sottocategoria
  categoryName?: string;  // Nome della categoria (opzionale)
  subCategoryName?: string;  // Nome della sottocategoria (opzionale)
  userName: string;
}


export interface OrderStatsDto {
  months: number[];
  earnings: number[];
  ordersCount: number[];
}

export interface Category {
  categoryID: number;
  categoryName: string;
}

export interface SubCategory {
  subCategoryID: number;
  subCategoryName: string;
  categoryID: number;
}

export interface SubCategoryDto {
  subCategoryID: number;
  subCategoryName: string;
  categoryID: number;
}

export interface CategoryDto {
  categoryID: number;
  categoryName: string;
  subCategories: SubCategoryDto[];  // Ogni categoria ha una lista di sottocategorie
}

