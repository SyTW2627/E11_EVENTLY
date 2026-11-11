import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login', 
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent { 
  loginForm: FormGroup;       

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router 
  ) {
    // Creamos el formulario solo con email y password (el login no pide nombre)
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Usamos el método iniciarSesion del servicio
      this.authService.iniciarSesion(this.loginForm.value).subscribe({
        next: (respuesta: any) => { // <-- Arreglado el tipado estricto
          console.log('Login exitoso', respuesta);
          
          // 1. Guardamos el token en el localStorage (SCRUM-45)
          if (respuesta.token) {
             this.authService.setToken(respuesta.token);
          }
          
          // 2. Redirigimos al perfil tras iniciar sesión (Atraviesa el Guard de la SCRUM-46)
          this.router.navigate(['/perfil']); 
        },
        error: (error: any) => { 
          console.error('Error en el login', error);
          alert('Credenciales incorrectas');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}