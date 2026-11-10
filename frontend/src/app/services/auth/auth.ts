import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth'; 
  
  // Clave bajo la que se guardará el token en el navegador
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  // PETICIONES AL BACKEND

  registrarUsuario(datosUsuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datosUsuario); 
  }  
    
    iniciarSesion(credenciales: any): Observable<any> { 
      return this.http.post(`${this.apiUrl}/login`, credenciales); 
    }

  // GESTIÓN DEL TOKEN

  // Guardar el token
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Leer el token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Borrar el token
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}