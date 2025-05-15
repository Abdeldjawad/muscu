import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './acceuil.component.html',
  styleUrls: ['./acceuil.component.css']
})
export class AccueilComponent {

  constructor(private router: Router) {
  }

  commencer() {
    this.router.navigate(['/inscription']);
  }

  goToConnexion() {
    this.router.navigate(['/connexion']);
  }
}
