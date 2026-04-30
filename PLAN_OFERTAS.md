# 📋 Planificación: Sección de Ofertas y Promociones

Este documento define la arquitectura y funcionalidad para la futura sección de **"Ofertas del Barrio"**.

## 1. Concepto General
Permitir que los negocios publiquen ofertas temporales (ej: "2x1 en Lomitos", "20% OFF en cortes") que aparecerán destacadas en la Home y en una sección dedicada.

## 2. Base de Datos (Firebase Firestore)
Crearemos una nueva colección llamada `ofertas`.

### Estructura de Datos (Schema)
```json
{
  "id": "auto-generated-id",
  "negocioId": "referencia-al-negocio",
  "titulo": "2x1 en Hamburguesas",
  "descripcion": "Válido solo los jueves",
  "precioOriginal": 8000,
  "precioOferta": 4000,
  "descuento": "50%", // Calculado o manual
  "imagenUrl": "https://...",
  "fechaInicio": "Timestamp",
  "fechaFin": "Timestamp", // Para expirar automáticamente
  "estado": "activa" // activa, pausada, vencida
}
```

## 3. Flujos de Usuario

### A. Para el Negocio (Cómo publicar)
**Opción 1 (Simple - Actual):**
- Agregar un checkbox en el formulario de "Publicar Negocio": *"¿Quiero publicar una oferta de bienvenida?"*.

**Opción 2 (Avanzada - Futura):**
- Crear una pantalla `/publicar-oferta` separada.
- El comerciante ingresa su WhatsApp (para validar identidad) y carga la promo.

### B. Para el Vecino (Cómo verlas)
1.  **Carrusel en Home**: Un slider horizontal arriba de las categorías llamado "🔥 Ofertas Bomba".
2.  **Etiqueta en Tarjeta**: En el listado de negocios, los que tengan oferta tendrán un badge `🏷️ Oferta`.
3.  **Sección Dedicada**: Página `/ofertas` donde se listan todas las promociones activas ordenadas por vencimiento.

## 4. Diseño UI (Borrador)
- **Tarjeta de Oferta**:
  - Foto del producto.
  - Título llamativo en negrita.
  - Precio tachado (viejo) y Precio Nuevo (grande en verde/naranja).
  - Botón "Pedir por WhatsApp" (pre-llena el mensaje: "Hola, vi la oferta del 2x1...").
  - "Quedan 2 días" (Count down o texto de urgencia).

## 5. Próximos Pasos (Implementación)
1.  Crear componente `OfferCard`.
2.  Crear componente `OfferCarousel` para la Home.
3.  Crear ruta `/ofertas`.
4.  Conectar con Firebase (crear colección `ofertas`).

---
*Este plan queda listo para ser ejecutado en la próxima sesión.*
