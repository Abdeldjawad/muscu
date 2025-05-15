import {Injectable} from '@angular/core';
import {catchError, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';


@Injectable(
  {
    providedIn: 'root'
  }
)
export class StatisticService {

  constructor(private http: HttpClient) {
  }

  public loadData(endpoint: string) {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(`http://localhost:5000/api/stats/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(err => {
        console.error(`Error loading ${endpoint} data:`, err);
        return of([]);
      })
    );
  }
}
