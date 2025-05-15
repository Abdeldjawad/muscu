import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';

interface User {
  id: number;
  nom: string;
  email: string;
  age?: number;
  poids?: number;
  taille?: number;
  sexe?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/user';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // Get current user value synchronously
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserData(email: string): Observable<User> {
    const token = localStorage.getItem('token');

    
    return this.http.post<User>(
      `${this.apiUrl}/find-by-email`,
      {email},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      tap(user => {
        this.setCurrentUser(user);
      }),
      catchError(this.handleError)
    );
  }

  setCurrentUser(userData: any): void {
    this.currentUserSubject.next(userData.user);
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('❌ Erreur HTTP:', error);
    let errorMessage = 'Une erreur est survenue, veuillez réessayer.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur : ${error.error.message}`;
    } else {
      if (error.status === 400) {
        errorMessage = error.error.message || "Identifiants incorrects.";
      } else if (error.status === 401) {
        errorMessage = "Accès refusé. Veuillez vous reconnecter.";
        this.clearCurrentUser();
      } else if (error.status === 404) {
        errorMessage = "Ressource non trouvée.";
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
