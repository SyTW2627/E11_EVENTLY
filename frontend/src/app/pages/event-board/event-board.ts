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
  eventosInscritos = signal<Record<string, boolean>>({});
  procesandoEventoId = signal<string | null>(null);
  feedbackMensaje = signal<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

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

  inscribirse(eventoId: string): void {
    this.procesandoEventoId.set(eventoId);
    this.feedbackMensaje.set(null);

    this.apiService.post<{ mensaje: string; evento: Evento }>(`events/${eventoId}/inscripcion`, {}).subscribe({
      next: (res) => {
        this.eventos.update((lista) =>
          lista.map((ev) => (ev._id === eventoId ? res.evento : ev))
        );
        this.eventosInscritos.update((mapa) => ({ ...mapa, [eventoId]: true }));
        this.feedbackMensaje.set({ tipo: 'exito', texto: res.mensaje || 'Inscripción realizada correctamente' });
        this.procesandoEventoId.set(null);
      },
      error: (err) => {
        const msg = err?.error?.mensaje || 'No se pudo completar la inscripción.';
        // Si el backend avisa de que ya estaba inscrito, sincronizamos el botón
        if (err?.status === 409 && msg.toLowerCase().includes('ya estás inscrito')) {
          this.eventosInscritos.update((mapa) => ({ ...mapa, [eventoId]: true }));
        }
        this.feedbackMensaje.set({ tipo: 'error', texto: msg });
        this.procesandoEventoId.set(null);
      }
    });
  }

  darseDeBaja(eventoId: string): void {
    this.procesandoEventoId.set(eventoId);
    this.feedbackMensaje.set(null);

    this.apiService.delete<{ mensaje: string; evento: Evento }>(`events/${eventoId}/inscripcion`).subscribe({
      next: (res) => {
        this.eventos.update((lista) =>
          lista.map((ev) => (ev._id === eventoId ? res.evento : ev))
        );
        this.eventosInscritos.update((mapa) => ({ ...mapa, [eventoId]: false }));
        this.feedbackMensaje.set({ tipo: 'exito', texto: res.mensaje || 'Baja realizada correctamente' });
        this.procesandoEventoId.set(null);
      },
      error: (err) => {
        const msg = err?.error?.mensaje || 'No se pudo procesar la baja.';
        this.feedbackMensaje.set({ tipo: 'error', texto: msg });
        this.procesandoEventoId.set(null);
      }
    });
  }
}