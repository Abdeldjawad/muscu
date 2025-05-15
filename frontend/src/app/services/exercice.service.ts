// exercice.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ExerciceService {
  private apiUrl = 'http://localhost:5000/api'; // Changed to port 5000

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(`${this.apiUrl}/exercices`); // Full correct URL
  }
}
