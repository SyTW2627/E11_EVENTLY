import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  // Formulario de perfil con sus validaciones
  profileForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required]],
    telefono: ['', [Validators.pattern('^[0-9]{9}$')]], // Validación básica de 9 números
    biografia: ['', [Validators.maxLength(200)]]
  });

  ngOnInit() {
    // Aquí en el futuro haremos un this.api.get('users/me') para cargar 
    // los datos actuales del usuario y rellenar el formulario usando:
    // this.profileForm.patchValue(datosDelBackend);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const profileData = this.profileForm.getRawValue();
      
      // Simulamos la petición PUT para actualizar el perfil
      this.api.put('users/profile', profileData).subscribe({
        next: (response) => {
          console.log('¡Perfil actualizado!', response);
          alert('Tus datos se han guardado correctamente.');
        },
        error: (err) => {
          console.error('Error al actualizar el perfil', err);
          alert('Hubo un error al guardar los datos.');
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
}