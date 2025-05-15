import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule], // ✅ Ajoute CommonModule pour éviter les erreurs
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'] // ✅ Corrige "styleUrl" en "styleUrls"
})
export class TrainingComponent {
  trainings = [
    { name: "Cardio", duration: "30 min", calories: 300 },
    { name: "Musculation", duration: "45 min", calories: 500 }
  ];
}
