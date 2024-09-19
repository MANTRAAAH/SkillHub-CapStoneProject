import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CategoryManagementComponent } from '../category-management/category-management.component'; // Importa il componente
import { AdminGuard } from '../../../guards/admin.guard'; // Se hai un guard specifico

const routes: Routes = [
  {
    path: 'categories',
    component: CategoryManagementComponent,
    // Facoltativo, se vuoi proteggere la route solo per gli admin
  }
];

@NgModule({
  declarations: [CategoryManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes) // Definisci le rotte figlie
  ]
})
export class AdminModule {}
