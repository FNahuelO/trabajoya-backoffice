# TrabajoYa - Backoffice

Panel de administración minimalista y funcional para gestionar todas las funcionalidades de la plataforma TrabajoYa.

## Características

- **Dashboard**: Vista general con estadísticas clave
- **Gestión de Trabajos**: Listado, moderación y aprobación/rechazo
- **Gestión de Usuarios**: Visualización de usuarios, empresas y postulantes
- **Aplicaciones**: Seguimiento de postulaciones
- **Mensajes y Llamadas**: Monitoreo de comunicación entre usuarios
- **Suscripciones**: Gestión de planes de empresas

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (iconos)
- date-fns (formateo de fechas)

## Instalación

```bash
cd Backoffice
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto:

```
VITE_API_URL=http://localhost:4000
```

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

```bash
npm run build
```

## Uso

1. Inicia sesión con las credenciales de un usuario válido
2. Navega por las diferentes secciones usando el menú lateral
3. Utiliza los filtros para encontrar información específica
4. Realiza acciones de moderación en trabajos pendientes

## Estructura

```
src/
  components/     # Componentes reutilizables
  contexts/       # Contextos de React (Auth)
  pages/          # Páginas principales
  services/       # Servicios API
  types/          # Tipos TypeScript
```

## Notas

- El backoffice requiere autenticación JWT
- Algunas acciones requieren permisos de administrador
- Las respuestas de la API siguen el formato estándar de TrabajoYa
