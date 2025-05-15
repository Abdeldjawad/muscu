import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-inscription',
  standalone: true,
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgIf]
})
export class InscriptionComponent {
  inscriptionForm: FormGroup;
  message: string = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.inscriptionForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(10)]],
      poids: ['', [Validators.required, Validators.min(30)]],
      taille: ['', [Validators.required, Validators.min(100)]],
      sexe: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.inscriptionForm.valid) {
      this.authService.register(this.inscriptionForm.value).subscribe({
        next: (response) => {
          this.message = '✅ Inscription réussie ! Redirection en cours...';
          setTimeout(() => this.router.navigate(['/connexion']), 2000);
        },
        error: (err) => {
          this.message = err.error.message || '❌ Une erreur est survenue. Veuillez réessayer.';
        }
      });
    } else {
      this.message = '❌ Remplissez tous les champs correctement.';
    }
  }

  goToConnexion() {
    this.router.navigate(['/connexion']);
  }
}
