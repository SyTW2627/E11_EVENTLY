import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth'; // <-- Ruta corregida

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.registrarUsuario(this.registerForm.value).subscribe({
        next: (respuesta: any) => { // <-- Añadido : any
          console.log('Usuario registrado con éxito', respuesta);
          alert('¡Registro exitoso!');
        },
        error: (error: any) => { // <-- Añadido : any
          console.error('Error en el registro', error);
          alert('Hubo un error al registrarse.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}