import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { EventPublishComponent } from './event-publish';

describe('EventPublishComponent', () => {
  let component: EventPublishComponent;
  let fixture: ComponentFixture<EventPublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPublishComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(EventPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TEST 1: Comprobar que no revienta al crearse
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Estado inicial del formulario
  it('debe inicializar el formulario como inválido y con maxParticipantes en 10', () => {
    expect(component.publishForm.valid).toBe(false);
    expect(component.publishForm.get('maxParticipantes')?.value).toBe(10);
  });

  // TEST 3: Validaciones individuales de los campos
  it('debe validar la longitud mínima del título', () => {
    const tituloControl = component.publishForm.controls['titulo'];
    
    // Título demasiado corto
    tituloControl.setValue('Fut');
    expect(tituloControl.valid).toBe(false);
    expect(tituloControl.hasError('minlength')).toBe(true);

    // Título válido
    tituloControl.setValue('Pachanga en la ULL');
    expect(tituloControl.valid).toBe(true);
  });

  it('debe requerir un mínimo de 2 participantes', () => {
    const participantesControl = component.publishForm.controls['maxParticipantes'];
    
    // Número inválido
    participantesControl.setValue(1);
    expect(participantesControl.valid).toBe(false);
    expect(participantesControl.hasError('min')).toBe(true);

    // Número válido
    participantesControl.setValue(2);
    expect(participantesControl.valid).toBe(true);
  });

  // TEST 4: Comportamiento de envío (onSubmit)
  it('debe marcar todos los campos como "touched" si el formulario es inválido al enviar', () => {
    // Espiamos el console.log para que no ensucie la salida de Karma
    vi.spyOn(console, 'log');
    
    // Dejamos los campos vacíos (el form será inválido)
    component.onSubmit();
    
    // Comprobamos que el título se marcó como tocado para mostrar los errores en rojo
    expect(component.publishForm.get('titulo')?.touched).toBe(true);
    expect(component.publishForm.get('deporte')?.touched).toBe(true);
    expect(component.publishForm.get('fecha')?.touched).toBe(true);
    
    // Como era inválido, NO debió hacer el console.log de éxito
    expect(console.log).not.toHaveBeenCalled();
  });
});