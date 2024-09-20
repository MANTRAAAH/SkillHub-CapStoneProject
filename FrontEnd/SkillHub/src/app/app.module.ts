import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ServicesListComponent } from './components/services/services-list/services-list.component';
import { ServiceDetailComponent } from './components/services/service-detail/service-detail.component'; // Importa il modulo dei bottoni
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { OrdersComponent } from './components/dashboard/pages/orders/orders.component';
import { ProfileComponent } from './components/dashboard/pages/profile/profile.component';
import { ServicesComponent } from './components/dashboard/pages/services/services.component';
import { ChartsComponent } from './components/dashboard/pages/charts/charts.component';
import { BaseChartDirective } from 'ng2-charts'; // Usa NgChartsModule
import { Chart, registerables } from 'chart.js';
import { PaymentComponent } from './components/payment/payment/payment.component';
import { ChatUsersComponent } from './components/chat/chat-users/chat-users.component';
import { ChatWindowComponent } from './components/chat/chat-window/chat-window.component';
import { ToastrModule } from 'ngx-toastr';
import { FieldsetModule } from 'primeng/fieldset'; // Importa FieldsetModule
import { TableModule } from 'primeng/table'; // Importa TableModule
import { CategoryManagementComponent } from './components/admin/category-management/category-management.component';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputGroupModule } from 'primeng/inputgroup';
import { MessageModule } from 'primeng/message';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';



Chart.register(...registerables);
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
    ChartsComponent,
    PaymentComponent,
    ChatUsersComponent,
    ChatWindowComponent
  ],
  imports: [
    BrowserModule,
    BaseChartDirective,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    RouterModule,
    DropdownModule,
    InputNumberModule,
    ProgressSpinnerModule,
    ProgressBarModule,
    InputGroupModule,
    MessageModule,
    MenubarModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    InputTextareaModule,
    PasswordModule,
    HttpClientModule,
    TableModule,
    FieldsetModule,
    CarouselModule,
    ButtonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
