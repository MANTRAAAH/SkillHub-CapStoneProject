
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { ServicesListComponent } from './components/services/services-list/services-list.component';
import { ServiceDetailComponent } from './components/services/service-detail/service-detail.component';
import { AuthGuard } from './guards/auth.guard';
import { ChatUsersComponent } from './components/chat/chat-users/chat-users.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat', component: ChatUsersComponent, canActivate: [AuthGuard] },
  { path: 'chat/:userId', component: ChatComponent,canActivate:[AuthGuard] },
  { path: 'services', component: ServicesListComponent, canActivate: [AuthGuard] },
  { path: 'services/:id', component: ServiceDetailComponent,canActivate:[AuthGuard] },
  { path: 'home', pathMatch: 'full', component: HomeComponent },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./components/dashboard/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
