import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

interface User {
  user_id: string;
  nom: string;
  email: string;
  age: number;
  poids: number;
  taille: number;
  sexe: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {
  }


  getUserData(email: string) {
    return this.http.get(`${this.apiUrl}/${email}`).pipe(catchError(this.handleError));
  }


  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        localStorage.setItem('currentUser', credentials.email);

      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    this.clearUser();
    // Ajoutez ici l'appel API pour le logout si nécessaire
  }

  private handleAuthentication(response: any): void {
    if (response?.user) {
      const user: User = {
        user_id: response.user.user_id,
        nom: response.user.nom,
        email: response.user.email,
        age: response.user.age,
        poids: response.user.poids,
        taille: response.user.taille,
        sexe: response.user.sexe,
        created_at: response.user.created_at
      };
    }
  }

  private clearUser(): void {
    localStorage.removeItem('currentUser');
  }


  // ✅ Gestion des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('❌ Erreur HTTP:', error);
    let errorMessage = 'Une erreur est survenue, veuillez réessayer.';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 400) {
        errorMessage = error.error.message || "Identifiants incorrects.";
      } else if (error.status === 401) {
        errorMessage = "Accès refusé. Veuillez vous reconnecter.";
      } else if (error.status === 404) {
        errorMessage = "Ressource non trouvée.";
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
