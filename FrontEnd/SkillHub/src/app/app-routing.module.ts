import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { ServicesListComponent } from './components/services/services-list/services-list.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat', component: ChatComponent },
  {path: 'services',component: ServicesListComponent},
  { path: 'home',pathMatch: 'full' , component: HomeComponent},
  { path: '**', redirectTo: '/home'} // Catch-all route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
