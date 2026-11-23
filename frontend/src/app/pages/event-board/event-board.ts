import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EventCardComponent } from '../../components/event-card/event-card';
import { ApiService } from '../../core/services/api';

export interface Evento {
  _id: string;
  titulo: string;
  descripcion?: string;
  disciplina: string;
  nivel: string;
  ubicacion: {
    instalacion: string;
    zona: string;
  };
  fechaInicio: string;
  fechaFin: string;
  aforoMin: number;
  aforoMax: number;
  estado: 'activo' | 'cancelado';
  inscritos: { usuario: { _id: string; nombre: string }; fechaInscripcion: string }[];
  plazasLibres?: number;
  completo?: boolean;
}

export interface RespuestaEventos {
  eventos: Evento[];
  paginacion: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

@Component({
  selector: 'app-event-board',
  imports: [EventCardComponent, DatePipe],
  templateUrl: './event-board.html',
  styleUrls: ['./event-board.scss']
})
export class EventBoardComponent implements OnInit {
  private apiService = inject(ApiService);

  eventos = signal<Evento[]>([]);
  isLoading = signal(true);
  errorMensaje = signal('');

  filtros = {
    texto: '',
    deporte: '',
    fecha: ''
  };

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.isLoading.set(true);
    this.errorMensaje.set('');

    this.apiService.get<RespuestaEventos>('events').subscribe({
      next: (res) => {
        this.eventos.set(res.eventos || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar eventos:', err);
        this.errorMensaje.set('No se pudieron cargar los eventos. Inténtalo de nuevo más tarde.');
        this.isLoading.set(false);
      }
    });
  }

  aplicarFiltros(): void {
    console.log('Filtros aplicados:', this.filtros);
  }
}