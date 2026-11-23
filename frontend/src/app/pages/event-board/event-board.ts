import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [EventCardComponent, DatePipe, FormsModule],
  templateUrl: './event-board.html',
  styleUrls: ['./event-board.scss']
})
export class EventBoardComponent implements OnInit {
  private apiService = inject(ApiService);

  eventos = signal<Evento[]>([]);
  isLoading = signal(true);
  errorMensaje = signal('');

  filtros = {
    zona: '',
    disciplina: '',
    fecha: ''
  };

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.isLoading.set(true);
    this.errorMensaje.set('');

    const params: Record<string, string> = {};
    if (this.filtros.zona.trim()) params['zona'] = this.filtros.zona.trim();
    if (this.filtros.disciplina) params['disciplina'] = this.filtros.disciplina;
    if (this.filtros.fecha) params['fecha'] = this.filtros.fecha;

    this.apiService.get<RespuestaEventos>('events', params).subscribe({
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
    this.cargarEventos();
  }
}