import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();
      
      // Enviamos la petición POST al backend 
      this.api.post('login', credentials).subscribe({
        next: (response: any) => {
          console.log('¡Login exitoso!', response);
          // Más adelante aquí guardaremos el token JWT en el LocalStorage
          // y redirigiremos al usuario a la pantalla principal:
          // this.router.navigate(['/']); 
        },
        error: (err) => {
          console.error('Error en la autenticación', err);
          alert('Error al iniciar sesión. Comprueba tus datos o el estado del servidor.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}