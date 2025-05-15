import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ConnexionComponent {
  connexionForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.connexionForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.connexionForm.valid) {
      console.log("📡 Envoi de la requête de connexion...");

      this.authService.login(this.connexionForm.value).subscribe(
        (response: any) => {
          console.log('✅ Connexion réussie !', response);
          alert(response.message); // Afficher un message de succès
          localStorage.setItem('token', response.token); // ✅ Stocker le token
          this.router.navigate(['/dashboard']); // ✅ Redirection après connexion
        },
        (error) => {
          console.error('❌ Erreur de connexion :', error);
          this.errorMessage = error.message;
        }
      );
    } else {
      this.errorMessage = "Veuillez remplir correctement le formulaire.";
    }
  }

  goToInscription() {
    this.router.navigate(['/inscription']);
  }
}
