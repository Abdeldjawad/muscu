import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { catchError, forkJoin, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

export interface MetricData {
  name: string;
  value: number;
}

interface SeriesData {
  name: string;
  series: MetricData[];
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, NgxChartsModule,FormsModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  colorScheme: Color = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal
  } as Color;

  weightData: MetricData[] = [];
  caloriesData: MetricData[] = [];
  performanceData: SeriesData[] = [];
  measurementsData: SeriesData[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  exampleMessage: string | null = null;
  isAddingData = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Authentication required';
      return;
    }

    this.loadAllStats(token);
  }

  private loadAllStats(token: string) {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin([
      this.loadData('weight', token),
      this.loadData('calories', token),
      this.loadData('performance', token),
      this.loadData('measurements', token)
    ]).subscribe({
      next: ([weight, calories, performance, measurements]) => {
        this.weightData = this.formatWeightData(weight);
        this.caloriesData = this.formatBasicData(calories);
        this.performanceData = this.formatPerformanceData(performance);
        this.measurementsData = this.formatMeasurementsData(measurements);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.errorMessage = 'Failed to load statistics';
        this.isLoading = false;
      }
    });
  }

  addExampleData() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Authentication required';
      return;
    }

    this.isAddingData = true;
    this.exampleMessage = 'Adding example data...';

    this.http.post('http://localhost:5000/api/stats/add-example-data', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response: any) => {
        this.exampleMessage = response.message;
        this.isAddingData = false;
        this.loadAllStats(token); // Refresh data
        setTimeout(() => this.exampleMessage = null, 3000);
      },
      error: (err) => {
        this.exampleMessage = 'Error adding example data';
        this.isAddingData = false;
        console.error('Example data error:', err);
      }
    });
  }

  private loadData(endpoint: string, token: string) {
    return this.http.get<any[]>(`http://localhost:5000/api/stats/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        console.error(`Error loading ${endpoint} data:`, err);
        return of([]);
      })
    );
  }

  private formatWeightData(data: any[]): MetricData[] {
    return data.map(entry => ({
      name: new Date(entry.date).toLocaleDateString(),
      value: entry.value
    }));
  }

  private formatBasicData(data: any[]): MetricData[] {
        return data.map(entry => ({
          name: new Date(entry.date).toLocaleDateString(),
          value: entry.value
        }));
  }

  private formatPerformanceData(data: any[]): SeriesData[] {
    const exerciseTypes = [...new Set(data.map(item => item.type))];
    return exerciseTypes.map(type => ({
      name: `${this.capitalizeFirstLetter(type)} (kg)`,
      series: data
        .filter(item => item.type === type)
        .map(item => ({
          name: new Date(item.date).toLocaleDateString(),
          value: item.value
        }))
    }));
  }

  private formatMeasurementsData(data: any[]): SeriesData[] {
    return [
      {
        name: 'Tour de poitrine (cm)',
        series: data.map(entry => ({
          name: new Date(entry.date).toLocaleDateString(),
          value: entry.chest
        }))
      },
      {
        name: 'Tour de taille (cm)',
        series: data.map(entry => ({
          name: new Date(entry.date).toLocaleDateString(),
          value: entry.waist
        }))
      }
    ];
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Add these new properties to your component class
  showWeightForm = false;
  showCaloriesForm = false;
  newWeight = { value: null, date: new Date().toISOString().split('T')[0] };
  newCalories = { value: null, date: new Date().toISOString().split('T')[0] };

// Add these new methods to your component class
  toggleWeightForm() {
    this.showWeightForm = !this.showWeightForm;
    this.showCaloriesForm = false;
  }

  toggleCaloriesForm() {
    this.showCaloriesForm = !this.showCaloriesForm;
    this.showWeightForm = false;
  }

  addWeight() {
    const token = localStorage.getItem('token');
    if (!token || !this.newWeight.value) return;

    this.http.post(`http://localhost:5000/api/stats/weight`,
      {
        value: this.newWeight.value,
        date: this.newWeight.date
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadAllStats(token);
        this.showWeightForm = false;
        this.newWeight = { value: null, date: new Date().toISOString().split('T')[0] };
      },
      error: (err) => console.error('Error adding weight:', err)
    });
  }

  addCalories() {
    const token = localStorage.getItem('token');
    if (!token || !this.newCalories.value) return;

    this.http.post(`http://localhost:5000/api/stats/calories`,
      {
        value: this.newCalories.value,
        date: this.newCalories.date
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.loadAllStats(token);
        this.showCaloriesForm = false;
        this.newCalories = { value: null, date: new Date().toISOString().split('T')[0] };
      },
      error: (err) => console.error('Error adding calories:', err)
    });
  }

}


