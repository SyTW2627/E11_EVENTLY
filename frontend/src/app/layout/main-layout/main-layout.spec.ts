import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MainLayoutComponent } from './main-layout';
import { AuthService } from '../../services/auth/auth';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    // 1. Preparamos el espía para que el <app-header> (que es hijo de este componente) pueda arrancar sin dar error
    const authSpy = { getToken: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]), // Para que el <router-outlet> y el Header funcionen
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Angular pinta el HTML
  });

  // TEST 1: Creación estructural
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Comprobación del esqueleto de la aplicación
  it('debe contener el header, el contenedor principal con router-outlet y el footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verificamos que el "sandwich" arquitectónico está bien montado
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('main.contenido-principal')).toBeTruthy();
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});