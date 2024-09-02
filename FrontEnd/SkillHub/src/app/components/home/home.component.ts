import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  services: any[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadPlaceholderServices();
  }


  loadRandomServices() {
    this.apiService.getRandomServices().subscribe(
      (data) => {
        this.services = data;
      },
      (error) => {
        console.error('Errore nel caricamento dei servizi', error);
      }
    );
  }
  loadPlaceholderServices() {
    this.services = [
      { title: 'Web Development', category: 'Development', subCategory: 'Web Development', user: 'John Doe', price: 100 },
      { title: 'Graphic Design', category: 'Design', subCategory: 'Graphic Design', user: 'Jane Smith', price: 80 },
      { title: 'SEO Optimization', category: 'Marketing', subCategory: 'SEO', user: 'Alice Johnson', price: 150 },
      { title: 'Mobile App Development', category: 'Development', subCategory: 'Mobile Development', user: 'Bob Brown', price: 200 },
      { title: 'Content Writing', category: 'Writing', subCategory: 'Content Writing', user: 'Emma White', price: 50 },
      { title: 'Video Editing', category: 'Media', subCategory: 'Video Editing', user: 'Chris Green', price: 120 }
    ];
  }
}
