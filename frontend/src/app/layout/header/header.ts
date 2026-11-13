import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Al usar un 'get', Angular lo evalúa dinámicamente. 
  // Devolverá true si existe el token en el navegador, y false si no.
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Método listo para tu botón de (click)="logout()" en el HTML
  logout() {
    // Borramos el rastro
    localStorage.removeItem('auth_token');
    
    // Lo mandamos al login
    this.router.navigate(['/login']);
  }
}