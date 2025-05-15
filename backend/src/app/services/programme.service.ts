import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Add throwError here
import { catchError } from 'rxjs/operators'; // Add catchError here

@Injectable({
  providedIn: 'root'
})
export class ProgrammeService {
  private apiUrl = 'http://localhost:5000/api/programmes';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserProgrammes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: this.getHeaders()
    });
  }

  addExampleProgrammes(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/examples`,
      {},
      { headers: this.getHeaders() }
    );
  }

  addExercice(programmeId: number, exerciceId: number, series: number, repetitions: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${programmeId}/exercices`,
      { exerciceId, series, repetitions },
      { headers: this.getHeaders() }
    );
  }

  // Optional: Keep if you still need creation capability
  createProgramme(name: string): Observable<any> {
    return this.http.post(
      this.apiUrl,
      { name },
      { headers: this.getHeaders() }
    );
  }
  // programme.service.ts
  createProgramWithExercises(programData: {
    name: string,
    exercises: {
      exerciceId: number,
      series?: number,
      repetitions?: number
    }[]
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/programmes/create-with-exercises`,
      programData
    ).pipe(
      catchError(error => {
        console.error('Error creating program:', error);
        return throwError(() => new Error(
          error.error?.message || 'Failed to create program'
        ));
      })
    );
  }
}
