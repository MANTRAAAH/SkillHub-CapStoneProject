import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { ServicesListComponent } from './components/services/services-list/services-list.component';
import { ServiceDetailComponent } from './components/services/service-detail/service-detail.component'; // Import del componente per i dettagli
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { OrdersComponent } from './components/dashboard/pages/orders/orders.component';
import { ProfileComponent } from './components/dashboard/pages/profile/profile.component';
import { ServicesComponent } from './components/dashboard/pages/services/services.component';
import { ChartsComponent } from './components/dashboard/pages/charts/charts.component';
import { FreelancerGuard } from './guards/freelancer.guard';
import { ChatUsersComponent } from './components/chat/chat-users/chat-users.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat', component: ChatUsersComponent },
  { path: 'chat/:userId', component: ChatComponent },
  { path: 'services', component: ServicesListComponent },
  { path: 'services/:id', component: ServiceDetailComponent }, // Aggiunta della route per i dettagli del servizio
  { path: 'home', pathMatch: 'full', component: HomeComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'orders', component: OrdersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'services', component: ServicesComponent},
      { path: 'charts', component: ChartsComponent },
      { path: '', redirectTo: 'orders', pathMatch: 'full' } // Redirect predefinito
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
