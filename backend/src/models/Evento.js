// Modelo de evento deportivo (colección "eventos").
// Solo define la estructura y las validaciones de los datos. La lógica de inscripción,
// baja y comentarios pertenece a otras tareas: aquí únicamente se declara su esquema.
const mongoose = require('mongoose');
const { NIVELES, DISCIPLINAS } = require('../utils/constantes');

// Un evento puede exigir un nivel concreto o estar abierto a todos los niveles.
const NIVELES_EVENTO = [...NIVELES, 'todos'];
const ESTADOS_EVENTO = ['activo', 'cancelado'];

const esEntero = (valor) => Number.isInteger(valor);

// Usuario inscrito en el evento. No necesita _id propio: se identifica por el usuario.
const inscritoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El usuario inscrito es obligatorio'],
    },
    fechaInscripcion: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Comentario de un participante. Conserva su _id para poder referenciarlo más adelante.
const comentarioSchema = new mongoose.Schema({
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  texto: {
    type: String,
    required: [true, 'El texto del comentario es obligatorio'],
    trim: true,
    maxlength: [500, 'El comentario no puede superar los 500 caracteres'],
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

const eventoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [80, 'El título no puede superar los 80 caracteres'],
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede superar los 500 caracteres'],
    },

    disciplina: {
      type: String,
      required: [true, 'La disciplina es obligatoria'],
      enum: {
        values: DISCIPLINAS,
        message: `La disciplina '{VALUE}' no es válida. Valores permitidos: ${DISCIPLINAS.join(', ')}`,
      },
    },

    nivel: {
      type: String,
      enum: {
        values: NIVELES_EVENTO,
        message: `El nivel '{VALUE}' no es válido. Valores permitidos: ${NIVELES_EVENTO.join(', ')}`,
      },
      default: 'todos',
    },

    ubicacion: {
      instalacion: {
        type: String,
        required: [true, 'La instalación es obligatoria'],
        trim: true,
        maxlength: [100, 'La instalación no puede superar los 100 caracteres'],
      },
      zona: {
        type: String,
        required: [true, 'La zona es obligatoria'],
        trim: true,
        maxlength: [60, 'La zona no puede superar los 60 caracteres'],
      },
    },

    // MongoDB guarda las fechas siempre en UTC. La API recibe fechas en ISO 8601
    // (por ejemplo, "2026-11-20T18:00:00Z") y las devuelve también en UTC.
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
      validate: {
        // Solo se exige fecha futura al crear: editar o leer eventos ya pasados no debe fallar.
        validator: function (valor) {
          if (!this.isNew) return true;
          return valor.getTime() > Date.now();
        },
        message: 'La fecha de inicio debe ser posterior a la fecha actual',
      },
    },

    fechaFin: {
      type: Date,
      required: [true, 'La fecha de fin es obligatoria'],
      validate: {
        validator: function (valor) {
          if (!this.fechaInicio) return true;
          return valor.getTime() > this.fechaInicio.getTime();
        },
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      },
    },

    aforoMin: {
      type: Number,
      required: [true, 'El aforo mínimo es obligatorio'],
      min: [2, 'El aforo mínimo debe ser al menos 2'],
      validate: {
        validator: esEntero,
        message: 'El aforo mínimo debe ser un número entero',
      },
    },

    aforoMax: {
      type: Number,
      required: [true, 'El aforo máximo es obligatorio'],
      validate: [
        {
          validator: esEntero,
          message: 'El aforo máximo debe ser un número entero',
        },
        {
          validator: function (valor) {
            if (typeof this.aforoMin !== 'number') return true;
            return valor >= this.aforoMin;
          },
          message: 'El aforo máximo debe ser mayor o igual que el aforo mínimo',
        },
      ],
    },

    organizador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El organizador es obligatorio'],
    },

    estado: {
      type: String,
      enum: {
        values: ESTADOS_EVENTO,
        message: `El estado '{VALUE}' no es válido. Valores permitidos: ${ESTADOS_EVENTO.join(', ')}`,
      },
      default: 'activo',
    },

    inscritos: {
      type: [inscritoSchema],
      validate: [
        {
          validator: (lista) => {
            const ids = lista.map((inscrito) => String(inscrito.usuario));
            return new Set(ids).size === ids.length;
          },
          message: 'Un usuario no puede estar inscrito más de una vez en el mismo evento',
        },
        {
          validator: function (lista) {
            if (typeof this.aforoMax !== 'number') return true;
            return lista.length <= this.aforoMax;
          },
          message: 'El número de inscritos no puede superar el aforo máximo',
        },
      ],
    },

    comentarios: {
      type: [comentarioSchema],
    },
  },
  {
    // Añade createdAt y updatedAt automáticamente
    timestamps: true,
    collection: 'eventos',
    // Se desactiva el virtual "id" para no duplicar _id en las respuestas
    id: false,
    // Al convertir a JSON se incluyen los virtuales y nunca se expone la versión interna
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Plazas que quedan libres hasta llegar al aforo máximo.
eventoSchema.virtual('plazasLibres').get(function () {
  return this.aforoMax - (this.inscritos ? this.inscritos.length : 0);
});

// Indica si el evento ya ha alcanzado su aforo máximo.
eventoSchema.virtual('completo').get(function () {
  return this.plazasLibres <= 0;
});

// Índices para las consultas previstas (tablón por fecha, disciplina y zona, estado y
// eventos de un organizador). Mongoose los crea al conectar (autoIndex).
eventoSchema.index({ fechaInicio: 1 });
eventoSchema.index({ disciplina: 1, fechaInicio: 1 });
eventoSchema.index({ 'ubicacion.zona': 1 });
eventoSchema.index({ estado: 1 });
eventoSchema.index({ organizador: 1 });

module.exports = mongoose.model('Evento', eventoSchema);
