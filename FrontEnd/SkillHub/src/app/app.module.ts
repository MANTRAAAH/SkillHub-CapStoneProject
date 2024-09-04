import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/main/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CarouselModule } from 'primeng/carousel';  // Importa il modulo del carosello
import { ButtonModule } from 'primeng/button';
import { ServicesListComponent } from './components/services/services-list/services-list.component';
import { ServiceDetailComponent } from './components/services/service-detail/service-detail.component'; // Importa il modulo dei bottoni
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { OrdersComponent } from './components/dashboard/pages/orders/orders.component';
import { ProfileComponent } from './components/dashboard/pages/profile/profile.component';
import { ServicesComponent } from './components/dashboard/pages/services/services.component';
import { ChartsComponent } from './components/dashboard/pages/charts/charts.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    ChatComponent,
    LoginComponent,
    RegisterComponent,
    ServicesListComponent,
    ServiceDetailComponent,
    DashboardComponent,
    OrdersComponent,
    ProfileComponent,
    ServicesComponent,
    ChartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    CarouselModule,  // Aggiungi il modulo del carosello
    ButtonModule,  // Aggiungi il modulo dei bottoni
    BrowserAnimationsModule  // Aggiungi BrowserAnimationsModule se hai bisogno di animazioni
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
