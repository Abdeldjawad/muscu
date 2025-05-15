import {Component, OnInit} from '@angular/core';
import {AsyncPipe, CommonModule} from '@angular/common';
import {map, Observable} from 'rxjs';
import {User} from '../services/models/user.model';
import {UserService} from '../services/user.service';
import {Color, LineChartModule, ScaleType} from '@swimlane/ngx-charts';
import {StatisticService} from '../services/stats.service';
import {GetMaintenanceCalories} from './pipes/get-maintenance-calories.pipe';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [AsyncPipe, CommonModule, LineChartModule, GetMaintenanceCalories]
})
export class DashboardComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  loading = true;

  // Chart data

  chartData$!: Observable<any[]>;

  // Correct color scheme configuration
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // Chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Date';
  yAxisLabel = 'Calories';
  autoScale = true;

  constructor(
    public userService: UserService,
    private statsService: StatisticService
  ) {
    this.currentUser$ = this.userService.currentUser$ as Observable<any>;
  }

  ngOnInit() {
    this.initUserData();
    this.initChartData();
  }

  private initUserData() {
    const userEmail = localStorage.getItem('currentUser');
    if (userEmail) {
      this.userService.getUserData(userEmail).subscribe({
        next: (user: any) => {
          localStorage.setItem('userData', (user?.user.id).toString());
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  private initChartData() {
    this.chartData$ = this.statsService.loadData('calories').pipe(
      map(data => [{
        name: 'Calories',
        series: this.formatChartData(data)
      }])
    );
  }

  private formatChartData(rawData: any[]): any[] {
    return rawData.map(item => ({
      name: new Date(item.date).toLocaleDateString(),
      value: item.value
    }));
  }
}
