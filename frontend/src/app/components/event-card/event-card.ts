import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.html',
  styleUrls: ['./event-card.scss']
})
export class EventCardComponent {
  @Input() titulo: string = 'Partido amistoso';
  @Input() deporte: string = 'Fútbol';
  @Input() fecha: string = 'Próximamente';
  @Input() lugar: string = 'Por determinar';
  @Input() nivel: string = 'Amateur';
  @Input() inscritos: number = 0;
  @Input() aforoMaximo: number = 10;
  @Input() estaInscrito: boolean = false;
  @Input() cargandoAccion: boolean = false;

  @Output() apuntarse = new EventEmitter<void>();
  @Output() darseDeBaja = new EventEmitter<void>();

  get plazasDisponibles(): number {
    return this.aforoMaximo - this.inscritos;
  }

  get estaLleno(): boolean {
    return this.inscritos >= this.aforoMaximo;
  }
}