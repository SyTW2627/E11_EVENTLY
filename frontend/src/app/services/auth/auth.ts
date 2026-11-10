import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambia el puerto si tu backend corre en uno distinto
  private apiUrl = 'http://localhost:3000/api/auth'; 

  constructor(private http: HttpClient) { }

  registrarUsuario(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosUsuario);
  }

  iniciarSesion(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }
}