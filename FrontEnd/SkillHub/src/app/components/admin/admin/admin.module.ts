import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CategoryManagementComponent } from '../category-management/category-management.component'; // Importa il componente
import { AdminGuard } from '../../../guards/admin.guard'; // Se hai un guard specifico
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';

const routes: Routes = [
  {
    path: 'categories',
    component: CategoryManagementComponent,
  }
];

@NgModule({
  declarations: [CategoryManagementComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProgressSpinnerModule,
    TableModule,
    DropdownModule,
    MessageModule,
    MessagesModule,
    ButtonModule,
    RouterModule.forChild(routes) // Definisci le rotte figlie
  ]
})
export class AdminModule {}
