# Despliegue del Backoffice en Vercel

Esta guía explica cómo desplegar el backoffice de TrabajoYa en Vercel.

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Proyecto vinculado a un repositorio Git (GitHub, GitLab, Bitbucket)
3. Backend API desplegado y accesible

## Pasos para Desplegar

### 1. Instalar Vercel CLI (Opcional)

```bash
npm i -g vercel
```

### 2. Desplegar desde la CLI

```bash
cd Backoffice
vercel
```

Sigue las instrucciones interactivas para:
- Iniciar sesión en Vercel
- Vincular el proyecto
- Configurar el proyecto

### 3. Desplegar desde el Dashboard de Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio Git
3. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `Backoffice`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4. Configurar Variables de Entorno

En el dashboard de Vercel, ve a **Settings > Environment Variables** y agrega:

```
VITE_API_URL=https://tu-backend-api.vercel.app
```

O si tu backend está en otro lugar:
```
VITE_API_URL=https://api.trabajoya.com
```

**Importante**: Cambia `https://tu-backend-api.vercel.app` por la URL real de tu backend API.

### 5. Configurar Dominio Personalizado

1. Ve a **Settings > Domains**
2. Agrega tu dominio (ej: `admin.trabajoya.com` o `backoffice.trabajoya.com`)
3. Sigue las instrucciones para configurar los registros DNS:
   - **Tipo**: CNAME
   - **Nombre**: `admin` (o el subdominio que prefieras)
   - **Valor**: `cname.vercel-dns.com`

O si prefieres usar un dominio raíz:
- **Tipo**: A
- **Nombre**: @
- **Valor**: IP proporcionada por Vercel (se muestra en la configuración)

### 6. Configurar CORS en el Backend

Asegúrate de que tu backend API tenga configurado el dominio del backoffice en CORS:

```env
ALLOWED_ORIGINS=https://admin.trabajoya.com,https://tu-backoffice.vercel.app
```

### 7. Verificar el Despliegue

Una vez desplegado:
1. Visita la URL proporcionada por Vercel
2. Verifica que la aplicación carga correctamente
3. Prueba el login
4. Verifica que las peticiones a la API funcionan

## Configuración Actual

El proyecto está configurado con:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Routing**: SPA (Single Page Application) con rewrites para React Router

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `https://api.trabajoya.com` |

## Troubleshooting

### Error 404 en rutas

Si obtienes 404 al navegar directamente a rutas, verifica que `vercel.json` tenga la configuración de `rewrites` correcta.

### Errores de CORS

Verifica que:
1. La variable `VITE_API_URL` esté configurada correctamente
2. El backend tenga el dominio del backoffice en `ALLOWED_ORIGINS`

### Build falla

Verifica que:
1. Todas las dependencias estén en `package.json`
2. No haya errores de TypeScript
3. El comando `npm run build` funcione localmente

## Actualizaciones Automáticas

Si el proyecto está vinculado a un repositorio Git, Vercel desplegará automáticamente cada vez que hagas push a la rama principal (o la rama configurada).

## Comandos Útiles

```bash
# Verificar estado del proyecto
vercel ls

# Ver logs de despliegue
vercel logs

# Desplegar a producción
vercel --prod

# Abrir proyecto en el navegador
vercel open
```

