import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el servicio encuentra el token, abrimos la puerta (true)
  if (authService.getToken()) {
    return true;
  } 
  
  // Si no hay token, lo mandamos directo a la pantalla de login (false)
  router.navigate(['/login']);
  return false;
};