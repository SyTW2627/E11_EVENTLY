import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class OnboardingComponent {
  private router = inject(Router);

  comenzar() {
    // Cuando el usuario termine de leer, lo llevamos a configurar su perfil
    this.router.navigate(['/perfil']);
  }
}