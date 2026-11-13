import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink], // Importamos lo necesario para Standalone
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class RegistroComponent {
  registroForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
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
      console.log('Datos listos para enviar:', this.registroForm.value);
      
      // Tras registrarse, llevamos al usuario al onboarding de bienvenida
      this.router.navigate(['/onboarding']);
    } else {
      // Si hay errores, forzamos a que se muestren marcando todo como "tocado"
      this.registroForm.markAllAsTouched();
    }
  }
}