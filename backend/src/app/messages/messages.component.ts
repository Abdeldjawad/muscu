import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  form: FormGroup;
  message = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    console.log("📤 Soumission du message...", this.form.value);
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn("❌ Aucun token trouvé !");
      return;
    }
  
    this.http.put('http://localhost:5000/api/auth/message', this.form.value, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log("✅ Message envoyé !");
        this.message = "✅ Message enregistré avec succès !";
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'envoi :", err);
        this.message = "❌ Erreur lors de l'enregistrement du message.";
      }
    });
  }
  
}
