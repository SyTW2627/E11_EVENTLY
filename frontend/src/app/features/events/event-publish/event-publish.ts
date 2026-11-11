import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-event-publish',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-publish.html',
  styleUrls: ['./event-publish.scss']
})
export class EventPublishComponent {
  publishForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Creamos el formulario con sus validaciones
    this.publishForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      deporte: ['', Validators.required],
      fecha: ['', Validators.required],
      ubicacion: ['', Validators.required],
      maxParticipantes: [10, [Validators.required, Validators.min(2)]]
    });
  }

  onSubmit() {
    if (this.publishForm.valid) {
      console.log('Formulario listo para enviar al backend:', this.publishForm.value);
      // Aquí llamaremos al EventService en el futuro para mandarlo a la API
    } else {
      this.publishForm.markAllAsTouched(); // Marca en rojo lo que falte
    }
  }
}