# 🚀 QUICK START: Tests [F2] Contador Global de Likes

## ⚡ Ejecución Rápida

### 1️⃣ BACKEND (movie-bff)

```powershell
# Terminal en: c:\xampp\htdocs\movie-bff

# Asegurar que PostgreSQL está corriendo
docker ps | Select-String "postgres"

# Ejecutar tests del contador global
npm test -- likesTotal.test.ts

# Con coverage
npm test -- --coverage likesTotal.test.ts

# Ejecutar todos los tests
npm test
```

**✅ Resultado Esperado:**
```
PASS  src/__tests__/likesTotal.test.ts
  ✓ debe retornar 0 cuando no hay likes (45ms)
  ✓ debe retornar el total correcto con una sola película (38ms)
  ✓ debe sumar correctamente likes de múltiples películas (42ms)
  ✓ debe actualizarse en tiempo real (156ms)
  ✓ debe manejar grandes cantidades de likes (89ms)
  ✓ debe responder en menos de 100ms con 1000 películas (67ms)
  ✓ debe mantener consistencia con operaciones concurrentes (234ms)

Tests: 12 passed, 12 total
Coverage: 85%+
```

---

### 2️⃣ FRONTEND (movie-webapp)

#### Paso A: Instalar dependencias (si no están)

```powershell
# Terminal en: movie-webapp/

npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui @vitest/coverage-v8
```

#### Paso B: Crear archivos de configuración

**`vitest.config.ts`** (raíz del proyecto):
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**`vitest.setup.ts`** (raíz del proyecto):
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
```

**`package.json`** (añadir scripts):
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

#### Paso C: Crear componente GlobalCounter

**`src/components/GlobalCounter/GlobalCounter.tsx`**:
```typescript
import React, { useEffect, useState } from 'react';

interface GlobalCounterProps {
  refreshTrigger?: number;
}

export const GlobalCounter: React.FC<GlobalCounterProps> = ({ refreshTrigger = 0 }) => {
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTotalLikes = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/likes/total`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setTotalLikes(data.data.totalLikes);
      }
    } catch (err) {
      console.error('Error fetching total likes:', err);
      setError('Error al cargar el contador');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalLikes();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="global-counter loading" data-testid="global-counter-loading">
        <span>⏳</span>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-counter error" data-testid="global-counter-error">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="global-counter" data-testid="global-counter">
      <div className="counter-content">
        <span>❤️</span>
        <div className="counter-info">
          <span className="label">Total de Likes</span>
          <span className="value" data-testid="total-likes-value">
            {totalLikes.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalCounter;
```

**`src/components/GlobalCounter/index.ts`**:
```typescript
export { GlobalCounter } from './GlobalCounter';
```

#### Paso D: Crear tests

**`src/components/GlobalCounter/GlobalCounter.test.tsx`**:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalCounter } from './GlobalCounter';

global.fetch = vi.fn();

describe('GlobalCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  });

  it('debe mostrar estado de carga inicialmente', () => {
    (global.fetch as any).mockImplementation(() =>
      new Promise(() => {})
    );

    render(<GlobalCounter />);
    expect(screen.getByTestId('global-counter-loading')).toBeInTheDocument();
  });

  it('debe mostrar el total de likes correctamente', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { totalLikes: 42 }
      })
    });

    render(<GlobalCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('global-counter')).toBeInTheDocument();
    });

    expect(screen.getByTestId('total-likes-value')).toHaveTextContent('42');
  });

  it('debe mostrar 0 cuando no hay likes', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { totalLikes: 0 }
      })
    });

    render(<GlobalCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('0');
    });
  });

  it('debe mostrar mensaje de error cuando falla la petición', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<GlobalCounter />);

    await waitFor(() => {
      expect(screen.getByTestId('global-counter-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Error al cargar el contador')).toBeInTheDocument();
  });

  it('debe actualizar el contador cuando cambia refreshTrigger', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          data: { totalLikes: callCount * 10 }
        })
      });
    });

    const { rerender } = render(<GlobalCounter refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('10');
    });

    rerender(<GlobalCounter refreshTrigger={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('20');
    });

    expect(callCount).toBe(2);
  });
});
```

#### Paso E: Ejecutar tests

```powershell
# Ejecutar tests
npm run test:run

# Con UI interactiva
npm run test:ui

# Con coverage
npm run test:coverage
```

**✅ Resultado Esperado:**
```
✓ src/components/GlobalCounter/GlobalCounter.test.tsx (5)
  ✓ debe mostrar estado de carga inicialmente (123ms)
  ✓ debe mostrar el total de likes correctamente (89ms)
  ✓ debe mostrar 0 cuando no hay likes (67ms)
  ✓ debe mostrar mensaje de error cuando falla (92ms)
  ✓ debe actualizar el contador cuando cambia refreshTrigger (145ms)

Tests: 5 passed, 5 total
Coverage: 85%+
```

---

## 📋 Checklist Final

### Backend (movie-bff):
- [ ] PostgreSQL corriendo
- [ ] Tests pasan: `npm test -- likesTotal.test.ts`
- [ ] 12 tests ✅ passed
- [ ] Coverage >80%
- [ ] Endpoint `/api/likes/total` retorna status 200

### Frontend (movie-webapp):
- [ ] Vitest configurado (`vitest.config.ts` + `vitest.setup.ts`)
- [ ] Componente `GlobalCounter.tsx` creado
- [ ] Tests creados: `GlobalCounter.test.tsx`
- [ ] Tests pasan: `npm run test:run`
- [ ] 5 tests ✅ passed
- [ ] Coverage >80%

### Integración:
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend puede llamar a `/api/likes/total`
- [ ] Contador se actualiza correctamente

---

## 🎯 Comandos de Verificación Rápida

```powershell
# BACKEND
cd c:\xampp\htdocs\movie-bff
npm test -- likesTotal.test.ts

# FRONTEND
cd movie-webapp
npm run test:run

# VERIFICAR ENDPOINT MANUALMENTE
curl http://localhost:3000/api/likes/total
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'vitest'"
```powershell
npm install --save-dev vitest
```

### Error: "jsdom is not defined"
```powershell
npm install --save-dev jsdom
```

### Error: "Pool has ended"
- Reiniciar PostgreSQL
- Verificar que la base de datos existe

### Tests fallan por timeout
- Aumentar timeout en `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000
}
```

---

## ✅ ¡Listo!

Cuando todos los comandos pasen:
- ✅ Backend: 12/12 tests
- ✅ Frontend: 5/5 tests
- ✅ Coverage: >80%

**Tarjeta [F2] COMPLETADA** 🎉

---

**Fecha:** Noviembre 13, 2025  
**Proyecto:** Movie BFF + Movie WebApp  
**Tarjeta:** [F2] Test de Contador Global de Likes
