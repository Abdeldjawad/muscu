import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgrammeService } from '../services/programme.service';

@Component({
  selector: 'app-programmes',
  templateUrl: './programmes.component.html',
  standalone: true,
  styleUrls: ['./programmes.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ProgrammesComponent implements OnInit {
  programmes: any[] = [];
  isLoading = true;
  hasAddedExamples = false;

  constructor(
    private programmeService: ProgrammeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProgrammes();
  }

  loadProgrammes() {
    this.isLoading = true;
    this.programmeService.getUserProgrammes().subscribe({
      next: (data: any) => {
        this.programmes = data;
        this.isLoading = false;

        // Only add examples if no programs exist and haven't tried before
        if (data.length === 0 && !this.hasAddedExamples) {
          this.hasAddedExamples = true;
          this.addExampleProgrammes();
        }
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  addExampleProgrammes() {
    this.programmeService.addExampleProgrammes().subscribe({
      next: () => {
        alert('Example programs added successfully!');
        this.loadProgrammes();
      },
      error: (error) => {
        console.error('Error adding example programs:', error);
        alert('Failed to add example programs');
      }
    });
  }

  navigateToCatalogue(programmeId: number) {
    this.router.navigate(['/catalogue'], { queryParams: { programmeId } });
  }

  // Add this method to your component class
  createNewProgram() {
    // First navigate to catalogue with a blank state
    this.router.navigate(['/catalogue'], {
      queryParams: { createNew: true }
    });
  }
}
