import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OnboardingComponent } from './onboarding';

describe('OnboardingComponent', () => {
  let component: OnboardingComponent;
  let fixture: ComponentFixture<OnboardingComponent>;
  let routerSpy: any;

  beforeEach(async () => {
    // 1. Creamos un espía para el Router (para no navegar de verdad durante el test)
    const rSpy = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OnboardingComponent], // Al ser standalone, va en imports
      providers: [
        { provide: Router, useValue: rSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingComponent);
    component = fixture.componentInstance;
    
    // Inyectamos el espía
    routerSpy = TestBed.inject(Router) as any;
    
    fixture.detectChanges();
  });

  // TEST 1: Comprobar que no revienta al crearse
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Lógica del TypeScript
  it('debe redirigir a /perfil al ejecutar comenzar()', () => {
    // Llamamos a la función directamente desde TypeScript
    component.comenzar();
    
    // Comprobamos que usó el Router con la ruta correcta
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/perfil']);
  });

  // TEST 3: Interacción en el HTML
  it('debe ejecutar la navegación al hacer clic en el botón principal', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Seleccionamos el botón de la vista
    const botonComenzar = compiled.querySelector('button') as HTMLButtonElement;
    
    // Simulamos el clic del usuario
    botonComenzar.click();
    
    // El clic debería haber disparado la función y, por tanto, la navegación
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/perfil']);
  });
});