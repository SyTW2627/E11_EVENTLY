import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

@Component({
  selector: 'app-registro',
  standalone: true, 
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  // Validador personalizado para comprobar que las contraseñas son iguales
  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registroForm.valid) {
      // Extraemos confirmPassword para enviar solo email y password a la API
      const { confirmPassword, ...datosRegistro } = this.registroForm.value;

      // Disparamos la petición a la red
      this.authService.registrarUsuario(datosRegistro).subscribe({
        next: (respuesta: any) => {
          console.log('Usuario registrado con éxito', respuesta);
          
          // Guardamos el token si el backend lo devuelve
          if (respuesta.token) {
             this.authService.setToken(respuesta.token);
          }
          
          // Redirigimos al onboarding
          this.router.navigate(['/onboarding']);
        },
        error: (error: any) => {
          console.error('Error en el registro', error);
          alert('Hubo un error al registrarse. Revisa la consola.');
        }
      });
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}