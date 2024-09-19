import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { OrdersComponent } from '././../pages/orders/orders.component';
import { ProfileComponent } from '././../pages/profile/profile.component';
import { ServicesComponent } from '././../pages/services/services.component';
import { ChartsComponent } from '././../pages/charts/charts.component';
import { FreelancerGuard } from '../../../guards/freelancer.guard';
import { AuthGuard } from '../../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'services', component: ServicesComponent, canActivate: [FreelancerGuard] },
      { path: 'charts', component: ChartsComponent, canActivate: [FreelancerGuard] },
      { path: '', redirectTo: 'profile', pathMatch: 'full' } // Redirect predefinito
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
