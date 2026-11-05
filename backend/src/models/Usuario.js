// Modelo de usuario de la plataforma (colección "usuarios").
// Solo define la estructura y las validaciones de los datos: el hash de la contraseña
// se genera en la lógica de registro, no aquí.
const mongoose = require('mongoose');
const { NIVELES, DISCIPLINAS } = require('../utils/constantes');

// Comprobación sencilla de formato: texto@dominio.ext, sin espacios.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede superar los 50 caracteres'],
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      trim: true,
      // Se guarda siempre en minúsculas para que el email no distinga mayúsculas
      lowercase: true,
      match: [EMAIL_REGEX, 'El email no tiene un formato válido'],
    },

    // Hash de la contraseña. Con select: false no se devuelve en las consultas
    // salvo que se pida explícitamente con .select('+passwordHash').
    passwordHash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
    },

    nivel: {
      type: String,
      enum: {
        values: NIVELES,
        message: `El nivel '{VALUE}' no es válido. Valores permitidos: ${NIVELES.join(', ')}`,
      },
      default: 'principiante',
    },

    preferencias: {
      disciplinas: {
        type: [
          {
            type: String,
            enum: {
              values: DISCIPLINAS,
              message: `La disciplina '{VALUE}' no es válida. Valores permitidos: ${DISCIPLINAS.join(', ')}`,
            },
          },
        ],
        // No se permite repetir la misma disciplina en la lista
        validate: {
          validator: (lista) => new Set(lista).size === lista.length,
          message: 'Las disciplinas preferidas no pueden repetirse',
        },
      },
      zona: {
        type: String,
        trim: true,
        maxlength: [60, 'La zona no puede superar los 60 caracteres'],
      },
    },
  },
  {
    // Añade createdAt y updatedAt automáticamente
    timestamps: true,
    collection: 'usuarios',
    // Al convertir a JSON (por ejemplo, en res.json) nunca se expone el hash ni la versión interna
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Índice único sobre el email (nombre en MongoDB: email_1). Como el email se guarda en
// minúsculas, "Ana@Mail.com" y "ana@mail.com" cuentan como el mismo y el segundo falla
// con el error de clave duplicada 11000. Mongoose crea el índice al conectar (autoIndex).
usuarioSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
