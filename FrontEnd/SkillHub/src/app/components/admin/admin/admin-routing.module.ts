import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryManagementComponent } from '../category-management/category-management.component';
import { AdminGuard } from '../../../guards/admin.guard';

const routes: Routes = [
  {
    path: 'categories',
    component: CategoryManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
