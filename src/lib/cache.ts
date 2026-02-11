/**
 * Utilidad de caché con sessionStorage para evitar recargas lentas
 * cuando los datos no han cambiado.
 *
 * Estrategia: stale-while-revalidate
 * 1. Si hay datos cacheados, los devuelve inmediatamente.
 * 2. En background, obtiene los datos frescos del servidor.
 * 3. Si los datos cambiaron, actualiza el caché y notifica.
 * 4. TTL configurable para forzar refetch después de cierto tiempo.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
}

/** Genera un hash simple para comparar datos */
function simpleHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

function getCacheKey(key: string): string {
  return `cache_${key}`;
}

/** Obtener datos del caché */
export function getCachedData<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(getCacheKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

/** Guardar datos en el caché */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash: simpleHash(data),
    };
    sessionStorage.setItem(getCacheKey(key), JSON.stringify(entry));
  } catch {
    // sessionStorage lleno o no disponible, ignorar
  }
}

/** Verificar si el caché sigue válido según TTL (en ms) */
export function isCacheValid(key: string, ttlMs: number): boolean {
  const entry = getCachedData(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttlMs;
}

/** Verificar si los datos nuevos son diferentes a los cacheados */
export function hasDataChanged<T>(key: string, newData: T): boolean {
  const entry = getCachedData(key);
  if (!entry) return true;
  return entry.hash !== simpleHash(newData);
}

/** Invalidar una entrada de caché */
export function invalidateCache(key: string): void {
  try {
    sessionStorage.removeItem(getCacheKey(key));
  } catch {
    // ignorar
  }
}

/** Invalidar todo el caché de la app */
export function invalidateAllCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("cache_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignorar
  }
}

// TTL por defecto: 5 minutos
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

