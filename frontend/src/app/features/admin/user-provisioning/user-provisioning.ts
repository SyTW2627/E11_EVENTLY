import { Component } from '@angular/core';

@Component({
  selector: 'app-user-provisioning',
  imports: [],
  templateUrl: './user-provisioning.html',
  styleUrl: './user-provisioning.scss'
})
export class UserProvisioningComponent {
  usuarios = [
    { id: 1, nombre: 'Carlos Rivero', email: 'carlos@ull.edu.es', rol: 'Usuario', estado: 'Activo' },
    { id: 2, nombre: 'Marta Díaz', email: 'marta@ull.edu.es', rol: 'Administrador', estado: 'Activo' },
    { id: 3, nombre: 'Iván Suárez', email: 'ivan@ull.edu.es', rol: 'Usuario', estado: 'Pendiente' },
    { id: 4, nombre: 'Lucía Ortega', email: 'lucia@ull.edu.es', rol: 'Usuario', estado: 'Activo' }
  ];

  gestionarUsuario(nombre: string) {
    alert('Abriendo panel de gestión para: ' + nombre);
  }
}