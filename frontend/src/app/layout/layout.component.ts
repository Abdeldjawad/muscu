import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  public menuItems = [
    {label: 'Dashboard', route: '/dashboard'},
    {label: 'Programme', route: '/programmes'},
    {label: 'Statistiques', route: '/stats'},
    {label: 'Assistant IA', route: '/forum'},
    {label: 'Messages', route: '/messages'},
    {label: 'Paramètres', route: '/parametres'}
  ];

  constructor(private router: Router) {
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/connexion']); // Rediriger vers la connexion
  }
}
