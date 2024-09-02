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
import { ButtonModule } from 'primeng/button'; // Importa il modulo dei bottoni

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    ChatComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CarouselModule,  // Aggiungi il modulo del carosello
    ButtonModule,  // Aggiungi il modulo dei bottoni
    BrowserAnimationsModule  // Aggiungi BrowserAnimationsModule se hai bisogno di animazioni
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
