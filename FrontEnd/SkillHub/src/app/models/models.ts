export interface Service {
description: any;
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
  status: string;
  totalPrice: number;
}
