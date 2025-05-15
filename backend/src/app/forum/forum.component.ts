import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})
export class ForumComponent {
  question = '';
  answer = '';
  loading = false;

  constructor(private http: HttpClient) {}

  poserQuestion() {
    if (!this.question.trim()) return;

    this.loading = true;
    this.answer = '';

    this.http.post<any>('http://localhost:5000/api/forum/ask-ai', { question: this.question }).subscribe({
      next: (res) => {
        this.answer = res.answer;
        this.loading = false;
      },
      error: () => {
        this.answer = "❌ Une erreur est survenue.";
        this.loading = false;
      }
    });
  }
}
