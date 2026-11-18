import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.html',
  styleUrls: ['./event-card.scss']
})
export class EventCardComponent {
  // Datos que recibirá la tarjeta
  @Input() titulo: string = 'Partido amistoso';
  @Input() deporte: string = 'Fútbol';
  @Input() fecha: string = 'Próximamente';
  @Input() lugar: string = 'Por determinar';
  @Input() nivel: string = 'Amateur';
  @Input() inscritos: number = 0;
  @Input() aforoMaximo: number = 10;

  // Calculamos dinámicamente si está lleno
  get plazasDisponibles(): number {
    return this.aforoMaximo - this.inscritos;
  }

  get estaLleno(): boolean {
    return this.inscritos >= this.aforoMaximo;
  }
}