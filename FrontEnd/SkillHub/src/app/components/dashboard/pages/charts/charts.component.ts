import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { ChartData, ChartOptions } from 'chart.js';
import { OrderStatsDto } from '../../../../models/models';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {

  private months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

  // Dati dinamici per il grafico del ricavato
  public earningsChartData: ChartData<'line'> = {
    labels: this.months,
    datasets: [
      { data: [], label: 'Ricavato' }
    ]
  };

  // Dati dinamici per il grafico degli ordini completati
  public orderChartData: ChartData<'line'> = {
    labels: this.months,
    datasets: [
      { data: [], label: 'Ordini Completati' }
    ]
  };

  public chartOptions: ChartOptions = {
    responsive: true,
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadOrderStats();  // Carica sia il ricavato che gli ordini
  }

  // Carica i dati per il ricavato totale e gli ordini completati
  loadOrderStats() {
    this.apiService.getOrderStats().subscribe({
      next: (data: OrderStatsDto) => {
        this.earningsChartData = {
          labels: data.months.map(month => this.getMonthName(month)),
          datasets: [
            { data: data.earnings, label: 'Ricavato' }
          ]
        };

        this.orderChartData = {
          labels: data.months.map(month => this.getMonthName(month)),
          datasets: [
            { data: data.ordersCount, label: 'Ordini Completati' }
          ]
        };
      },
      error: (error) => {
        console.error('Errore nel caricamento delle statistiche:', error);
      }
    });
  }

  // Funzione di utilità per ottenere il nome del mese
  private getMonthName(monthNumber: number): string {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    return months[monthNumber - 1];
  }
}
