import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service'; // <-- 1. Importamos el servicio

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  // 2. Inyectamos AuthService en el constructor
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      // 3. Enviamos los datos al backend usando el servicio
      this.authService.registrarUsuario(this.registerForm.value).subscribe({
        next: (respuesta) => {
          console.log('Usuario registrado con éxito', respuesta);
          alert('¡Registro exitoso!');
        },
        error: (error) => {
          console.error('Error en el registro', error);
          alert('Hubo un error al registrarse.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}