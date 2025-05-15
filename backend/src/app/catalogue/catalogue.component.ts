// catalogue.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgrammeService } from '../services/programme.service';
import { ExerciceService } from '../services/exercice.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CatalogueComponent implements OnInit {
  exercices: any[] = [];
  selectedExercices: any[] = [];
  programmeId: number | null = null;
  newSeries = 3;
  newRepetitions = 10;
  isLoading = true;
  userId: number | null = null;

  constructor(
    private exerciceService: ExerciceService,
    private programmeService: ProgrammeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeUserData();
    this.route.queryParams.subscribe(params => {
      this.programmeId = params['programmeId'] ? parseInt(params['programmeId']) : null;
      this.loadExercices();
    });
  }

  initializeUserData() {
    const userEmail = localStorage.getItem('currentUser');
    if (userEmail) {
      this.userService.getUserData(userEmail).subscribe({
        next: (user: any) => {
          this.userId = user?.user?.id;
          localStorage.setItem('userData', this.userId?.toString() || '');
        },
        error: () => {
          console.error('Failed to get user data');
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadExercices() {
    this.isLoading = true;
    this.exerciceService.getAll().subscribe({
      next: (data: any) => {
        console.log('Raw API response:', data);  // Add this line
        this.exercices = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading exercises:', error);
        alert('Error loading exercises: ' + error.message);  // Show error to user
        this.isLoading = false;
      }
    });
  }

  isSelected(exerciceId: number): boolean {
    return this.selectedExercices.some(e => e.id === exerciceId);
  }

  toggleExerciceSelection(exercice: any) {
    const index = this.selectedExercices.findIndex(e => e.id === exercice.id);
    if (index === -1) {
      this.selectedExercices.push({
        ...exercice,
        series: this.newSeries,
        repetitions: this.newRepetitions
      });
    } else {
      this.selectedExercices.splice(index, 1);
    }
    console.log('Selected exercises:', this.selectedExercices); // Debug log
  }

  updateSetsReps(exercice: any, field: string, value: number) {
    const ex = this.selectedExercices.find(e => e.id === exercice.id);
    if (ex) {
      ex[field] = value;
    }
  }

  saveCustomProgram() {
    if (!this.userId) {
      alert('User not authenticated');
      return;
    }

    if (this.selectedExercices.length === 0) {
      alert('Please select at least one exercise');
      return;
    }

    if (!this.programmeId) {
      this.programmeService.createProgramme('Mon Programme Personnalisé').subscribe({
        next: (newProgram: any) => {
          this.programmeId = newProgram.id;
          this.addExercicesToProgram();
        },
        error: (error) => console.error('Error creating program:', error)
      });
    } else {
      this.addExercicesToProgram();
    }
  }


  private addExercicesToProgram() {
    const requests = this.selectedExercices.map(exercice =>
      this.programmeService.addExercice(
        this.programmeId!,
        exercice.id,
        exercice.series,
        exercice.repetitions
      ).toPromise()
    );

    Promise.all(requests).then(() => {
      alert('Program created successfully!');
      this.router.navigate(['/programmes']);
    }).catch(error => {
      console.error('Error adding exercises:', error);
      alert('Error updating program');
    });
  }
}
