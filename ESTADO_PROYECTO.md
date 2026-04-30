# Estado del Proyecto - Yofre al Toque (Next.js Version) 🚀

Este documento refleja el estado actual del desarrollo en la carpeta `web/`.

## ✅ Implementado (Versión Next.js 15)

### 1. Core & Arquitectura
- [x] **Framework**: Next.js 15.1.0 (App Router).
- [x] **Estilos**: Tailwind CSS 4.x + Vanilla CSS para componentes específicos.
- [x] **Estructura Base**: `src/app`, `src/components`, `src/lib`.

### 2. Navegación y Rutas
- [x] **Home (`/`)**: Landing page principal funcionado.
- [x] **Layout Principal**: Navbar y Footer integrados en `layout.js`.
- [x] **Publicar Negocio (`/publicar-negocio`)**: Formulario con diseño final "Figura 2" (Hero durazno, pasos espaciados).
- [x] **Búsqueda (`/negocios`, `/buscar`)**: Rutas creadas para funcionalidad de búsqueda.
- [x] **Rubros (`/rubro/[slug]`)**: Página dinámica para categorías.
- [x] **Detalle Comercio (`/comercio/[id]`)**: Página dinámica para perfil de negocio.
- [x] **Admin (`/admin`)**: Panel de administración (estructura base).
- [x] **Favoritos (`/favoritos`)**: Ruta para gestión de favoritos.
- [x] **Términos y Condiciones (`/terminos-condiciones`)**: Página legal.
- [x] **Ofertas (`/ofertas`)**: Página de ofertas con carrusel y tarjetas detalladas.

### 3. Componentes UI
- [x] **Navbar**: Logo Yofre, buscador y botón "+ Sumar Negocio".
- [x] **Footer**: Pie de página estándar.
- [x] **Categorías**: Componentes de visualización en Home.
- [x] **Tarjeta Oferta**: Componente reutilizable con diseño premium y responsive.

## 🚧 En Progreso / Pendiente

### 1. Integración Backend (Firebase)
- [x] **Persistencia**: Conectar formulario de "Publicar Negocio" a Firestore.
- [ ] **Configuración**: Verificar conexión en `src/lib/firebase`.
- [ ] **Autenticación**: Implementar login real en `/admin` y usuarios.

### 2. UI/UX Premium (Refinamiento con Skills)
- [ ] **Design System**: Unificar radios de borde ("Squircle") y sombras.
- [ ] **Mobile Touch**: Optimizar áreas de toque en Navbar y Listados.
- [ ] **Glassmorphism**: Aplicar efectos de vidrio consistentes en cards y headers.
- [x] **Publicar Negocio**:
  - [x] Refactorización completa de la UI para coincidir con diseño "Figura 2".
  - [x] Implementación de Hero strip color durazno (`#FFF0E6`).
  - [x] Pasos de beneficios con iconos grandes y espaciado generoso (`space-y-8`).
  - [x] Formulario minimalista centrado con `max-w-[480px]` y bordes redondeados.
  - [x] Navbar global visible.
  - [x] Ajustes finales de espaciado y márgenes visuales (Header, Steps, Button).
- [x] **Sección Ofertas**:
  - [x] Carrusel "Ofertas Bomba" con scroll horizontal fluido.
  - [x] Tarjetas de oferta responsive con badge de descuento y cuenta regresiva.
  - [x] Grid de "Todas las Ofertas" que se adapta a desktop/mobile.
  - [x] Navegación clickeable a detalle de comercio.

### 3. Limpieza y Optimización
- [ ] **Migración Completa**: Confirmar que no queda lógica útil en la versión Vanilla JS antigua.
- [ ] **SEO**: Implementar Metadata dinámica en páginas de detalle (`generateMetadata`).

### Próximos Pasos Prioritarios
1. **Integración con Firebase**: 
   - [x] Conectar el formulario de "Publicar Negocio" con Firestore real.
   - [x] **Panel de Admin**: Crear vista para aprobar/rechazar negocios.
   - [x] **Sección Ofertas**: Conectada a Firestore con datos reales.
   - [x] **Gestión Manual de Ofertas**: Formulario admin para crear ofertas desde el panel.
   - [x] **Seed de Datos**: Botones para cargar negocios y ofertas de prueba.
2. **SEO Básico**: 
   - [x] Configurar metadatos dinámicos en páginas de detalle.
   - [x] Agregar título y descripción OpenGraph en Layout.
3. **Mejoras en Servicios**: 
   - [x] Agregar categorías/subrubros específicos para servicios.
4. **Contacto Institucional**: 
   - [x] Agregar link o sección de contacto con Yofre al Toque en el footer o menú.
   - [x] Página dedicada `/contacto` sin marca personal excesiva.

### Sistema de Ofertas Completo ✅
- [x] Hook `useOfertas` para leer ofertas desde Firestore
- [x] Página `/ofertas` con carrusel y grid responsive
- [x] Formulario admin para crear ofertas manualmente
- [x] Selector de negocios aprobados
- [x] Cálculo automático de fechas de vencimiento
- [x] Botón de seed para cargar datos de prueba

## 📋 Próximos Pasos (Agendados)

### 3. Sistema de Favoritos Funcional ✅ **COMPLETADO**
- [x] Hook `useFavorites` con localStorage
- [x] Página `/favoritos` con diseño premium  
- [x] Botón de favorito funcional en página de detalle (`/negocio/[id]`)
- [x] Botón flotante circular arriba a la derecha
- [x] Botón grande "Guardar/Guardado" junto a WhatsApp
- [x] Indicador con badge en el navbar que se actualiza en tiempo real
- [x] Gestión completa (agregar, quitar, limpiar todo)
- [x] Estado empty state cuando no hay favoritos
- [x] Persistencia entre sesiones con localStorage
- [x] Sistema de eventos para actualizar el contador automáticamente

**Ubicación:** `/negocio/[id]/page.js` - Favoritos completamente funcionales

### 4. Autenticación de Usuarios
- [ ] Sistema de login/registro para usuarios finales
- [ ] Perfil de usuario
- [ ] Historial de interacciones
- [ ] Favoritos por usuario sincronizados (Firebase)

