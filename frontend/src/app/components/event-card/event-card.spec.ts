import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EventCardComponent } from './event-card';

describe('EventCardComponent', () => {
  let component: EventCardComponent;
  let fixture: ComponentFixture<EventCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe calcular las plazas disponibles correctamente', () => {
    component.aforoMaximo = 10;
    component.inscritos = 3;
    fixture.detectChanges();

    expect(component.plazasDisponibles).toBe(7);
    expect(component.estaLleno).toBe(false);
  });

  it('debe marcar el evento como lleno si los inscritos igualan el aforo máximo', () => {
    component.aforoMaximo = 14;
    component.inscritos = 14;
    fixture.detectChanges();

    expect(component.plazasDisponibles).toBe(0);
    expect(component.estaLleno).toBe(true);
  });

  it('debe mostrar el texto "¡Completo!" en el HTML cuando el aforo está lleno', () => {
    component.aforoMaximo = 4;
    component.inscritos = 4;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('¡Completo!');
  });

  it('debe mostrar el botón "Apuntarme" y emitir apuntarse al hacer clic', () => {
    const emitSpy = vi.spyOn(component.apuntarse, 'emit');
    component.aforoMaximo = 10;
    component.inscritos = 4;
    component.estaInscrito = false;
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent?.trim()).toBe('Apuntarme');
    boton.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar el botón "Darme de baja" y emitir darseDeBaja si el usuario ya está inscrito', () => {
    const emitSpy = vi.spyOn(component.darseDeBaja, 'emit');
    component.estaInscrito = true;
    fixture.detectChanges();

    const boton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(boton.textContent?.trim()).toBe('Darme de baja');
    boton.click();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});