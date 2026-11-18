import { Component, OnInit } from '@angular/core';
import { EventCardComponent } from '../../components/event-card/event-card';

@Component({
  selector: 'app-event-board',
  imports: [EventCardComponent],
  templateUrl: './event-board.html',
  styleUrls: ['./event-board.scss']
})
export class EventBoardComponent implements OnInit {
  
  // Objeto para almacenar el estado de los filtros
  filtros = {
    texto: '',
    deporte: '',
    fecha: ''
  };

  constructor() { }

  ngOnInit(): void {
    // Aquí luego llamaremos al servicio para cargar los eventos por defecto
  }

  // Función que se ejecutará al pulsar "Aplicar filtros"
  aplicarFiltros(): void {
    console.log('Filtros aplicados:', this.filtros);
    // Próximamente: Llamar al servicio de Adrián para que devuelva los eventos filtrados
  }
}