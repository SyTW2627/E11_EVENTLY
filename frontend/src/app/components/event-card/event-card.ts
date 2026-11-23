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
    return Math.max(0, this.aforoMaximo - this.inscritos);
  }

  get estaLleno(): boolean {
    return this.inscritos >= this.aforoMaximo;
  }

  get porcentajeOcupacion(): number {
    if (this.aforoMaximo <= 0) return 0;
    return Math.min(100, Math.round((this.inscritos / this.aforoMaximo) * 100));
  }

  get casiLleno(): boolean {
    return !this.estaLleno && this.porcentajeOcupacion >= 75;
  }
}