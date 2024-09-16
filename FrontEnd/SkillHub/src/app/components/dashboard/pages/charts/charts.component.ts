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

  // Definizione dei colori corrispondenti alle variabili SCSS
  private primaryColor = '#E67E22';     // Arancione
  private secondaryColor = '#F1C40F';   // Giallo Chiaro
  private accentColor = '#2980B9';      // Blu Scuro
  private backgroundColor = '#FAFAFA';  // Bianco Panna
  private textColor = '#2C3E50';        // Grigio Scuro

  // Dati dinamici per il grafico del ricavato
  public earningsChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ricavato',
        backgroundColor: this.primaryColor,
        borderColor: this.accentColor,
        hoverBackgroundColor: this.secondaryColor,
        borderWidth: 1
      }
    ]
  };

  // Dati dinamici per il grafico degli ordini completati
  public orderChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ordini Completati',
        backgroundColor: this.accentColor,
        borderColor: this.primaryColor,
        pointBackgroundColor: this.primaryColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: this.primaryColor,
        fill: false,
        tension: 0.1
      }
    ]
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: this.textColor // Colore del testo della legenda
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: this.textColor // Colore delle etichette sull'asse X
        },
        grid: {
          color: this.backgroundColor // Colore della griglia sull'asse X
        }
      },
      y: {
        ticks: {
          color: this.textColor // Colore delle etichette sull'asse Y
        },
        grid: {
          color: this.backgroundColor // Colore della griglia sull'asse Y
        }
      }
    }
  };

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadOrderStats();  // Carica sia il ricavato che gli ordini
  }

  // Carica i dati per il ricavato totale e gli ordini completati
  loadOrderStats() {
    this.apiService.getOrderStats().subscribe({
      next: (data: OrderStatsDto) => {
        const labels = data.months.map(month => this.getMonthName(month));

        // Aggiorna i dati del grafico del ricavato
        this.earningsChartData.labels = labels;
        this.earningsChartData.datasets[0].data = data.earnings;

        // Aggiorna i dati del grafico degli ordini completati
        this.orderChartData.labels = labels;
        this.orderChartData.datasets[0].data = data.ordersCount;
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
