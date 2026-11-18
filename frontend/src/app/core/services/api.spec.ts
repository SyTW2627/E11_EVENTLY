import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api'; // Asegúrate de que el nombre del archivo coincida

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Módulo especial para falsear peticiones HTTP
      providers: [ApiService]
    });
    
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Verificamos que no queden peticiones colgadas después de cada test
  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe hacer una petición GET a la URL correcta', () => {
    const endpoint = 'eventos';
    const datosSimulados = [{ id: 1, titulo: 'Partido de prueba' }];

    service.get(endpoint).subscribe(data => {
      expect(data).toEqual(datosSimulados);
    });

    // Atrapamos la petición que intentó salir
    const req = httpMock.expectOne('/api/eventos');
    expect(req.request.method).toBe('GET'); // Comprobamos que usó el verbo correcto
    
    // Le devolvemos datos falsos para que el subscribe se ejecute
    req.flush(datosSimulados);
  });

  it('debe hacer una petición POST enviando el body correcto', () => {
    const endpoint = 'eventos';
    const nuevoEvento = { titulo: 'Nuevo partido', deporte: 'Fútbol' };

    service.post(endpoint, nuevoEvento).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/eventos');
    expect(req.request.method).toBe('POST');
    // Verificamos que el body que envía el servicio es exactamente el que le pasamos
    expect(req.request.body).toEqual(nuevoEvento); 
    
    req.flush({ success: true });
  });

  it('debe hacer una petición PUT enviando el body correcto', () => {
    const endpoint = 'eventos/1';
    const eventoActualizado = { titulo: 'Partido de prueba modificado' };

    service.put(endpoint, eventoActualizado).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/eventos/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(eventoActualizado);
    
    req.flush({ success: true });
  });

  it('debe hacer una petición DELETE a la URL correcta', () => {
    const endpoint = 'eventos/1';

    service.delete(endpoint).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/eventos/1');
    expect(req.request.method).toBe('DELETE');
    
    req.flush({ success: true });
  });
});