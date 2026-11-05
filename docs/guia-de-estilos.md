# Guía de estilos y diseño de Evently

Esta guía recoge los valores de diseño de los mockups aprobados y cómo aplicarlos en el frontend Angular. Todos los valores están definidos como variables CSS en `frontend/src/styles/tokens.css`, que se importa desde `frontend/src/styles.scss`.

**Regla general:** en los componentes no se escriben colores, tamaños de letra, radios ni espaciados a mano. Siempre se usa la variable correspondiente (`var(--color-marca)`, `var(--espacio-4)`, etc.). Si falta un valor, se añade primero a `tokens.css` y a esta guía.

## 1. Tokens

### 1.1 Tipografía

Fuente: **Manrope** (pesos 400, 500, 600, 700 y 800), con `system-ui, sans-serif` de reserva.

| Uso | Variable de tamaño | Tamaño | Peso |
| --- | --- | --- | --- |
| Título de página | `--texto-titulo-pagina` | 36px | 800 |
| Título de sección | `--texto-titulo-seccion` | 20px | 800 |
| Título de tarjeta | `--texto-titulo-tarjeta` | 19px | 800 |
| Cuerpo | `--texto-cuerpo` | 16px | 400-500 |
| Texto secundario | `--texto-secundario` | 14px | 400-500 |
| Etiquetas | `--texto-etiqueta` | 13px | 700 |

| Variable | Valor |
| --- | --- |
| `--fuente-base` | `'Manrope', system-ui, sans-serif` |
| `--peso-regular` | 400 |
| `--peso-medio` | 500 |
| `--peso-seminegrita` | 600 |
| `--peso-negrita` | 700 |
| `--peso-extranegrita` | 800 |

### 1.2 Colores

| Uso | Variable | Valor |
| --- | --- | --- |
| Marca (verde) | `--color-marca` | `#0B5D3B` |
| Marca en hover | `--color-marca-hover` | `#08432A` |
| Fondo suave de marca 1 | `--color-marca-suave-1` | `#E7EFE9` |
| Fondo suave de marca 2 | `--color-marca-suave-2` | `#DDEBE2` |
| Fondo suave de marca 3 | `--color-marca-suave-3` | `#DFF2E6` |
| Fondo de página | `--color-fondo-pagina` | `#F4F6F2` |
| Superficie / tarjeta | `--color-superficie` | `#FFFFFF` |
| Borde de tarjeta | `--color-borde-tarjeta` | `#DDE3DB` |
| Borde de inputs y botones secundarios | `--color-borde-control` | `#C5CFC7` |
| Pista de la barra de ocupación | `--color-pista-ocupacion` | `#E4E9E3` |
| Texto principal | `--color-texto` | `#14201A` |
| Texto fuerte-secundario | `--color-texto-fuerte-secundario` | `#26332B` |
| Texto secundario | `--color-texto-secundario` | `#3F4B44` |
| Texto atenuado | `--color-texto-atenuado` | `#4A564F` |
| Texto sobre fondo de marca | `--color-texto-sobre-marca` | `#FFFFFF` |
| Plazas libres: barra | `--color-libre-barra` | `#1E8A4F` |
| Plazas libres: texto | `--color-libre-texto` | `#0B5D3B` |
| Plazas libres: fondo | `--color-libre-fondo` | `#DFF2E6` |
| Completo: barra | `--color-completo-barra` | `#B42323` |
| Completo: texto | `--color-completo-texto` | `#9E1B1B` |
| Completo: fondo | `--color-completo-fondo` | `#FBE5E5` |

### 1.3 Radios

| Uso | Variable | Valor |
| --- | --- | --- |
| Botones e inputs | `--radio-control` | 12px |
| Tarjetas | `--radio-tarjeta` | 16px |
| Insignias | `--radio-insignia` | 14px |
| Chips de filtro | `--radio-chip` | 22px |

### 1.4 Espaciado

Escala con base de 4px. Para márgenes, rellenos y separaciones (`gap`) se usan solo estos valores.

| Variable | Valor |
| --- | --- |
| `--espacio-1` | 4px |
| `--espacio-2` | 8px |
| `--espacio-3` | 12px |
| `--espacio-4` | 16px |
| `--espacio-5` | 20px |
| `--espacio-6` | 24px |
| `--espacio-7` | 28px |
| `--espacio-8` | 48px |

### 1.5 Accesibilidad

| Uso | Variable | Valor |
| --- | --- | --- |
| Altura mínima de cualquier elemento interactivo | `--altura-min-interactivo` | 44px |
| Contorno de foco | `--foco-contorno` | `3px solid var(--color-marca)` |
| Separación del contorno de foco | `--foco-separacion` | 2px |

## 2. Componentes base

Los ejemplos muestran el HTML y el CSS mínimo. Los nombres de clase son orientativos; lo importante es qué tokens usa cada componente.

### 2.1 Botones

Tres variantes, todas con altura mínima de 44px, radio de 12px y texto de 16px en peso 700.

```html
<button type="button" class="btn btn--primario">Apuntarme</button>
<button type="button" class="btn btn--secundario">Ver detalles</button>
<button type="button" class="btn btn--baja">Darme de baja</button>
```

```css
.btn {
  min-height: var(--altura-min-interactivo);
  padding: 0 var(--espacio-5);
  border-radius: var(--radio-control);
  border: 1px solid transparent;
  font-family: var(--fuente-base);
  font-size: var(--texto-cuerpo);
  font-weight: var(--peso-negrita);
  cursor: pointer;
}

/* Primario: acción principal de la pantalla (solo uno por vista) */
.btn--primario {
  background: var(--color-marca);
  color: var(--color-texto-sobre-marca);
}
.btn--primario:hover {
  background: var(--color-marca-hover);
}

/* Secundario: acciones de apoyo */
.btn--secundario {
  background: var(--color-superficie);
  color: var(--color-texto);
  border-color: var(--color-borde-control);
}
.btn--secundario:hover {
  background: var(--color-marca-suave-1);
}

/* Baja: acciones destructivas (darse de baja de un evento) */
.btn--baja {
  background: var(--color-superficie);
  color: var(--color-completo-texto);
  border-color: var(--color-completo-barra);
}
.btn--baja:hover {
  background: var(--color-completo-fondo);
}
```

### 2.2 Chip de filtro

Botón conmutable con radio de 22px. El estado activo se comunica con `aria-pressed`, no solo con el color.

```html
<button type="button" class="chip" aria-pressed="true">Pádel</button>
<button type="button" class="chip" aria-pressed="false">Fútbol</button>
```

```css
.chip {
  min-height: var(--altura-min-interactivo);
  padding: 0 var(--espacio-4);
  border-radius: var(--radio-chip);
  border: 1px solid var(--color-borde-control);
  background: var(--color-superficie);
  color: var(--color-texto-fuerte-secundario);
  font-family: var(--fuente-base);
  font-size: var(--texto-secundario);
  font-weight: var(--peso-seminegrita);
}
.chip[aria-pressed='true'] {
  background: var(--color-marca);
  border-color: var(--color-marca);
  color: var(--color-texto-sobre-marca);
}
```

### 2.3 Tarjeta de evento

```html
<article class="tarjeta-evento">
  <h3 class="tarjeta-evento__titulo">Pachanga de fútbol 7</h3>
  <p class="tarjeta-evento__meta">Sáb 14 nov · 18:00 · La Laguna</p>
  <!-- insignia de ocupación (2.4) -->
  <button type="button" class="btn btn--primario">Apuntarme</button>
</article>
```

```css
.tarjeta-evento {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-3);
  padding: var(--espacio-5);
  background: var(--color-superficie);
  border: 1px solid var(--color-borde-tarjeta);
  border-radius: var(--radio-tarjeta);
}
.tarjeta-evento__titulo {
  margin: 0;
  font-size: var(--texto-titulo-tarjeta);
  font-weight: var(--peso-extranegrita);
  color: var(--color-texto);
}
.tarjeta-evento__meta {
  margin: 0;
  font-size: var(--texto-secundario);
  color: var(--color-texto-secundario);
}
```

### 2.4 Insignia de ocupación

Siempre se muestran **texto y barra** juntos. El texto dice el estado ("3 plazas libres", "Completo") y la barra muestra la proporción ocupada.

```html
<div class="ocupacion ocupacion--libre">
  <span class="insignia">3 plazas libres</span>
  <div class="barra" role="progressbar" aria-label="Ocupación" aria-valuemin="0"
       aria-valuemax="14" aria-valuenow="11">
    <div class="barra__relleno" style="width: 78%"></div>
  </div>
</div>

<div class="ocupacion ocupacion--completo">
  <span class="insignia">Completo</span>
  <div class="barra" role="progressbar" aria-label="Ocupación" aria-valuemin="0"
       aria-valuemax="14" aria-valuenow="14">
    <div class="barra__relleno" style="width: 100%"></div>
  </div>
</div>
```

```css
.ocupacion {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-2);
}
.insignia {
  align-self: flex-start;
  padding: var(--espacio-1) var(--espacio-3);
  border-radius: var(--radio-insignia);
  font-size: var(--texto-etiqueta);
  font-weight: var(--peso-negrita);
}
.barra {
  height: var(--espacio-2);
  border-radius: var(--espacio-1);
  background: var(--color-pista-ocupacion);
  overflow: hidden;
}
.barra__relleno {
  height: 100%;
}

.ocupacion--libre .insignia {
  background: var(--color-libre-fondo);
  color: var(--color-libre-texto);
}
.ocupacion--libre .barra__relleno {
  background: var(--color-libre-barra);
}

.ocupacion--completo .insignia {
  background: var(--color-completo-fondo);
  color: var(--color-completo-texto);
}
.ocupacion--completo .barra__relleno {
  background: var(--color-completo-barra);
}
```

### 2.5 Input y select

Cada campo lleva una etiqueta `<label>` visible asociada con `for`/`id`. No se usa el `placeholder` como sustituto de la etiqueta.

```html
<label class="campo">
  <span class="campo__etiqueta">Zona</span>
  <input class="control" type="text" name="zona" />
</label>

<label class="campo">
  <span class="campo__etiqueta">Nivel</span>
  <select class="control" name="nivel">
    <option value="principiante">Principiante</option>
    <option value="intermedio">Intermedio</option>
    <option value="avanzado">Avanzado</option>
  </select>
</label>
```

```css
.campo {
  display: flex;
  flex-direction: column;
  gap: var(--espacio-2);
}
.campo__etiqueta {
  font-size: var(--texto-etiqueta);
  font-weight: var(--peso-negrita);
  color: var(--color-texto-fuerte-secundario);
}
.control {
  min-height: var(--altura-min-interactivo);
  padding: 0 var(--espacio-3);
  border: 1px solid var(--color-borde-control);
  border-radius: var(--radio-control);
  background: var(--color-superficie);
  color: var(--color-texto);
  font-family: var(--fuente-base);
  font-size: var(--texto-cuerpo);
}
```

## 3. Reglas de accesibilidad

1. **El estado de ocupación nunca se indica solo con color.** Siempre aparecen juntos el texto ("N plazas libres" / "Completo") y la barra. La barra lleva `role="progressbar"` con sus valores `aria-*`.
2. **Contraste mínimo de 4.5:1 para el texto** (3:1 para texto grande: 24px o más, o 19px o más en negrita). Antes de añadir una combinación nueva de texto y fondo, se calcula su ratio y se añade a la tabla de la sección 4.
3. **Foco visible.** Ningún elemento interactivo elimina el contorno de foco sin sustituirlo. Regla global recomendada:

   ```css
   :focus-visible {
     outline: var(--foco-contorno);
     outline-offset: var(--foco-separacion);
   }
   ```

4. **Altura mínima de 44px** en botones, chips, inputs, selects y enlaces que actúen como botón.
5. Los estados de los controles (chip activo, campo con error) se exponen también con atributos ARIA o texto, no solo con color.

## 4. Ratios de contraste

Calculados con la fórmula de luminancia relativa de WCAG 2.1.

### 4.1 Texto sobre fondo (mínimo 4.5:1)

| Texto | Fondo | Ratio | Cumple 4.5:1 |
| --- | --- | --- | --- |
| `#14201A` texto principal | `#FFFFFF` superficie | 16.78 | Sí |
| `#14201A` texto principal | `#F4F6F2` página | 15.43 | Sí |
| `#14201A` texto principal | `#E7EFE9` marca suave 1 | 14.32 | Sí |
| `#14201A` texto principal | `#DDEBE2` marca suave 2 | 13.63 | Sí |
| `#26332B` fuerte-secundario | `#FFFFFF` superficie | 13.20 | Sí |
| `#26332B` fuerte-secundario | `#F4F6F2` página | 12.14 | Sí |
| `#3F4B44` secundario | `#FFFFFF` superficie | 9.13 | Sí |
| `#3F4B44` secundario | `#F4F6F2` página | 8.39 | Sí |
| `#3F4B44` secundario | `#E7EFE9` marca suave 1 | 7.79 | Sí |
| `#4A564F` atenuado | `#FFFFFF` superficie | 7.68 | Sí |
| `#4A564F` atenuado | `#F4F6F2` página | 7.06 | Sí |
| `#0B5D3B` marca | `#FFFFFF` superficie | 7.95 | Sí |
| `#0B5D3B` marca | `#F4F6F2` página | 7.31 | Sí |
| `#0B5D3B` marca | `#E7EFE9` marca suave 1 | 6.78 | Sí |
| `#0B5D3B` marca | `#DDEBE2` marca suave 2 | 6.45 | Sí |
| `#0B5D3B` plazas libres | `#DFF2E6` fondo libre | 6.80 | Sí |
| `#FFFFFF` | `#0B5D3B` botón primario | 7.95 | Sí |
| `#FFFFFF` | `#08432A` botón primario (hover) | 11.37 | Sí |
| `#9E1B1B` completo / baja | `#FBE5E5` fondo completo | 6.64 | Sí |
| `#9E1B1B` botón de baja | `#FFFFFF` superficie | 8.00 | Sí |
| `#B42323` | `#FFFFFF` superficie | 6.55 | Sí |

Todas las combinaciones de texto de la paleta cumplen 4.5:1.

### 4.2 Elementos no textuales (referencia WCAG 1.4.11, mínimo 3:1)

Este criterio se aplica a los bordes que identifican un control y a las partes gráficas necesarias para entender la información.

| Elemento | Colores | Ratio | Cumple 3:1 |
| --- | --- | --- | --- |
| Relleno de barra "plazas libres" sobre su pista | `#1E8A4F` / `#E4E9E3` | 3.55 | Sí |
| Relleno de barra "completo" sobre su pista | `#B42323` / `#E4E9E3` | 5.32 | Sí |
| Borde de botón de baja | `#B42323` / `#FFFFFF` | 6.55 | Sí |
| Contorno de foco | `#0B5D3B` / `#FFFFFF` | 7.95 | Sí |
| Contorno de foco | `#0B5D3B` / `#F4F6F2` | 7.31 | Sí |
| **Borde de inputs y botones secundarios** | `#C5CFC7` / `#FFFFFF` | **1.60** | **No (pendiente de revisar)** |
| Borde de tarjeta | `#DDE3DB` / `#FFFFFF` | 1.31 | No (decorativo) |
| Borde de tarjeta | `#DDE3DB` / `#F4F6F2` | 1.20 | No (decorativo) |
| Pista de la barra | `#E4E9E3` / `#FFFFFF` | 1.23 | No (decorativo) |

Notas:

- **Borde de inputs y botones secundarios (`#C5CFC7`)**: no llega a 3:1. Se mantiene el valor de los mockups hasta que el equipo decida si se oscurece. Mientras tanto, los controles se identifican por su etiqueta visible y su texto.
- El borde de tarjeta y la pista de la barra son decorativos: la tarjeta se reconoce por su contenido y la ocupación se lee en el texto de la insignia y en el relleno de la barra, que sí cumplen.
