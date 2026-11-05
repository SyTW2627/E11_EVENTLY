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
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      // Se guarda siempre en minúsculas para que el email no distinga mayúsculas
      lowercase: true,
      match: EMAIL_REGEX,
    },

    // Hash de la contraseña. Con select: false no se devuelve en las consultas
    // salvo que se pida explícitamente con .select('+passwordHash').
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    nivel: {
      type: String,
      enum: NIVELES,
      default: 'principiante',
    },

    preferencias: {
      disciplinas: {
        type: [{ type: String, enum: DISCIPLINAS }],
        // No se permite repetir la misma disciplina en la lista
        validate: {
          validator: (lista) => new Set(lista).size === lista.length,
        },
      },
      zona: {
        type: String,
        trim: true,
        maxlength: 60,
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

module.exports = mongoose.model('Usuario', usuarioSchema);
