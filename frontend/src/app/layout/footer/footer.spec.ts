import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';
describe('FooterComponent', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer]
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Renderizamos el HTML
  });

  // TEST 1: Comprobamos que el componente se levanta bien
  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // TEST 2: Comprobamos el DOM (HTML estático)
  it('debe mostrar el texto de copyright correcto en el HTML', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Buscamos el texto exacto dentro de la etiqueta footer
    expect(compiled.textContent).toContain('© 2026 Evently App');
  });
});