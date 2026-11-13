import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { confirmPassword, ...datosRegistro } = this.registerForm.value;
      
      this.authService.registrarUsuario(this.registerForm.value).subscribe({
        next: (respuesta: any) => {
          console.log('Usuario registrado con éxito', respuesta);
          if (respuesta.token) {
             this.authService.setToken(respuesta.token);
          }
          this.router.navigate(['/onboarding']);
        },
        error: (error: any) => {
          console.error('Error en el registro', error);
          alert('Hubo un error al registrarse.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}