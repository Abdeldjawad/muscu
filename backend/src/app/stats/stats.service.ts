import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:5000/api/stats';

  constructor(private http: HttpClient) {}

  getWeightHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/weight`);
  }

  getCaloriesHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/calories`);
  }

  getPerformanceHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/performance`);
  }

  getMeasurementsHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/measurements`);
  }
}
