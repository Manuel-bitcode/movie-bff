# 🧪 Guía Completa: Tests de Contador Global de Likes en Tiempo Real

## 📋 Índice
1. [Backend - API Tests](#backend---api-tests)
2. [Frontend - Component Tests](#frontend---component-tests)
3. [Tests de Integración E2E](#tests-de-integración-e2e)
4. [Ejecución y Validación](#ejecución-y-validación)

---

## 🎯 Objetivo de la Tarjeta [F2]

Implementar y validar el **Contador Global de Likes** que muestra en tiempo real la suma total de likes de todas las películas en el sistema.

### Funcionalidades a Testear:
- ✅ Obtener total de likes (endpoint `/api/likes/total`)
- ✅ Actualización en tiempo real al dar like
- ✅ Manejo de múltiples películas
- ✅ Rendimiento con grandes cantidades
- ✅ Componente React GlobalCounter
- ✅ Integración con Context API

---

## 🔙 BACKEND - API Tests

### 📂 Paso 1: Crear archivo de tests

Crear archivo: `src/__tests__/likesTotal.test.ts`

```typescript
import request from 'supertest';
import app from '../app';
import pool from '../config/database';

describe('GET /api/likes/total - Contador Global de Likes', () => {
  beforeAll(async () => {
    // Limpiar base de datos antes de los tests
    await pool.query('DELETE FROM movie_likes');
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await pool.query('DELETE FROM movie_likes');
    await pool.end();
  });

  describe('✅ Casos de éxito', () => {
    it('debe retornar 0 cuando no hay likes en la base de datos', async () => {
      const response = await request(app)
        .get('/api/likes/total')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          totalLikes: 0
        },
        message: 'Total de likes calculado correctamente'
      });
    });

    it('debe retornar el total correcto con una sola película', async () => {
      // Insertar 1 película con 5 likes
      await pool.query(
        'INSERT INTO movie_likes (id, likes) VALUES ($1, $2)',
        ['tt0111161', 5]
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(5);

      // Limpiar
      await pool.query('DELETE FROM movie_likes');
    });

    it('debe sumar correctamente likes de múltiples películas', async () => {
      // Insertar múltiples películas
      await pool.query(
        'INSERT INTO movie_likes (id, likes) VALUES ($1, $2), ($3, $4), ($5, $6)',
        ['tt0111161', 10, 'tt0068646', 15, 'tt0468569', 8]
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(33); // 10 + 15 + 8

      // Limpiar
      await pool.query('DELETE FROM movie_likes');
    });

    it('debe actualizarse en tiempo real al incrementar likes', async () => {
      // Estado inicial: 0 likes
      let response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(0);

      // Incrementar like en película 1
      await request(app).post('/api/likes/tt0111161');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(1);

      // Incrementar like en película 2
      await request(app).post('/api/likes/tt0068646');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(2);

      // Incrementar otro like en película 1
      await request(app).post('/api/likes/tt0111161');
      response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(3);

      // Limpiar
      await pool.query('DELETE FROM movie_likes');
    });

    it('debe manejar grandes cantidades de likes', async () => {
      // Insertar 100 películas con diferentes cantidades de likes
      const values: string[] = [];
      let expectedTotal = 0;

      for (let i = 1; i <= 100; i++) {
        const likes = i * 2; // 2, 4, 6, 8, ..., 200
        values.push(`('tt${String(i).padStart(7, '0')}', ${likes})`);
        expectedTotal += likes;
      }

      await pool.query(
        `INSERT INTO movie_likes (id, likes) VALUES ${values.join(', ')}`
      );

      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalLikes).toBe(10100);

      // Limpiar
      await pool.query('DELETE FROM movie_likes');
    });
  });

  describe('⚡ Tests de rendimiento', () => {
    it('debe responder en menos de 100ms con 1000 películas', async () => {
      // Insertar 1000 películas
      const values: string[] = [];
      for (let i = 1; i <= 1000; i++) {
        values.push(`('tt${String(i).padStart(7, '0')}', ${Math.floor(Math.random() * 100)})`);
      }

      await pool.query(
        `INSERT INTO movie_likes (id, likes) VALUES ${values.join(', ')}`
      );

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/likes/total')
        .expect(200);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);

      expect(responseTime).toBeLessThan(100);
      expect(response.body.success).toBe(true);

      // Limpiar
      await pool.query('DELETE FROM movie_likes');
    });
  });

  describe('🛡️ Tests de resiliencia', () => {
    it('debe mantener consistencia con operaciones concurrentes', async () => {
      await pool.query('DELETE FROM movie_likes');

      // 50 operaciones concurrentes
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app).post(`/api/likes/tt${String(i % 10).padStart(7, '0')}`)
        );
      }

      await Promise.all(promises);

      const response = await request(app).get('/api/likes/total');
      expect(response.body.data.totalLikes).toBe(50);

      await pool.query('DELETE FROM movie_likes');
    });
  });
});
```

### 🔧 Paso 2: Ejecutar tests de backend

```bash
# En el terminal de movie-bff
npm test -- likesTotal.test.ts

# O ejecutar todos los tests
npm test

# Con coverage
npm test -- --coverage likesTotal.test.ts
```

### ✅ Criterios de Aceptación Backend:
- [ ] Endpoint `/api/likes/total` retorna status 200
- [ ] Retorna estructura correcta: `{ success, data: { totalLikes }, message }`
- [ ] Total es 0 cuando no hay películas
- [ ] Suma correctamente likes de múltiples películas
- [ ] Se actualiza en tiempo real al incrementar likes
- [ ] Maneja 1000+ películas en <100ms
- [ ] Maneja operaciones concurrentes correctamente

---

## 🎨 FRONTEND - Component Tests

### 📂 Paso 3: Estructura del componente GlobalCounter

**Ubicación:** `movie-webapp/src/components/GlobalCounter/`

```
GlobalCounter/
├── GlobalCounter.tsx       # Componente principal
├── GlobalCounter.test.tsx  # Tests del componente
├── GlobalCounter.module.css # Estilos (opcional)
└── index.ts               # Exportación
```

### 📄 Paso 4: Componente GlobalCounter.tsx

```typescript
import React, { useEffect, useState } from 'react';
import './GlobalCounter.module.css';

interface GlobalCounterProps {
  refreshTrigger?: number; // Prop para forzar actualización
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
  }, [refreshTrigger]); // Se actualiza cuando cambia refreshTrigger

  if (loading) {
    return (
      <div className="global-counter loading" data-testid="global-counter-loading">
        <span className="spinner">⏳</span>
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="global-counter error" data-testid="global-counter-error">
        <span className="icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="global-counter" data-testid="global-counter">
      <div className="counter-content">
        <span className="icon">❤️</span>
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

### 🧪 Paso 5: Tests del componente (Vitest + Testing Library)

**Archivo:** `movie-webapp/src/components/GlobalCounter/GlobalCounter.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GlobalCounter } from './GlobalCounter';

// Mock de fetch
global.fetch = vi.fn();

describe('GlobalCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  });

  describe('✅ Renderizado y estados', () => {
    it('debe mostrar estado de carga inicialmente', () => {
      (global.fetch as any).mockImplementation(() =>
        new Promise(() => {}) // Promise que nunca se resuelve
      );

      render(<GlobalCounter />);

      expect(screen.getByTestId('global-counter-loading')).toBeInTheDocument();
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('debe mostrar el total de likes correctamente', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { totalLikes: 42 },
          message: 'Total calculado'
        })
      });

      render(<GlobalCounter />);

      await waitFor(() => {
        expect(screen.getByTestId('global-counter')).toBeInTheDocument();
      });

      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('42');
      expect(screen.getByText('Total de Likes')).toBeInTheDocument();
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

    it('debe formatear números grandes con separadores', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { totalLikes: 1234567 }
        })
      });

      render(<GlobalCounter />);

      await waitFor(() => {
        const value = screen.getByTestId('total-likes-value').textContent;
        // Dependiendo del locale, puede ser "1,234,567" o "1.234.567"
        expect(value).toMatch(/1[,.]234[,.]567/);
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

    it('debe mostrar error cuando la respuesta no es ok', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<GlobalCounter />);

      await waitFor(() => {
        expect(screen.getByTestId('global-counter-error')).toBeInTheDocument();
      });
    });
  });

  describe('🔄 Actualización en tiempo real', () => {
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

      // Cambiar refreshTrigger debe hacer nueva petición
      rerender(<GlobalCounter refreshTrigger={1} />);

      await waitFor(() => {
        expect(screen.getByTestId('total-likes-value')).toHaveTextContent('20');
      });

      expect(callCount).toBe(2);
    });

    it('debe llamar al endpoint correcto', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { totalLikes: 0 }
        })
      });

      render(<GlobalCounter />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/likes/total'
        );
      });
    });
  });

  describe('⚡ Rendimiento', () => {
    it('debe renderizar rápidamente con números grandes', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { totalLikes: 9999999 }
        })
      });

      const startTime = performance.now();
      render(<GlobalCounter />);

      await waitFor(() => {
        expect(screen.getByTestId('global-counter')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      console.log(`⏱️ Tiempo de renderizado: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(1000);
    });
  });

  describe('🎨 Accesibilidad', () => {
    it('debe tener atributos data-testid para testing', async () => {
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
        expect(screen.getByTestId('total-likes-value')).toBeInTheDocument();
      });
    });
  });
});
```

### 🔧 Paso 6: Ejecutar tests de frontend

```bash
# En el terminal de movie-webapp
npm run test

# Modo watch
npm run test:watch

# Con coverage
npm run test:coverage

# Con UI interactiva
npm run test:ui
```

### ✅ Criterios de Aceptación Frontend:
- [ ] Componente muestra estado de carga inicial
- [ ] Muestra el total de likes correctamente
- [ ] Formatea números grandes (1,234,567)
- [ ] Maneja errores de red
- [ ] Se actualiza con prop `refreshTrigger`
- [ ] Llama al endpoint correcto
- [ ] Renderiza en <1s con números grandes
- [ ] Tiene atributos data-testid

---

## 🔗 TESTS DE INTEGRACIÓN E2E

### 📂 Paso 7: Test de integración completo

**Archivo:** `movie-webapp/src/__tests__/integration/GlobalCounter.integration.test.tsx`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GlobalCounter } from '../../components/GlobalCounter/GlobalCounter';
import request from 'supertest';

describe('Integración: GlobalCounter + Backend API', () => {
  const API_URL = 'http://localhost:3000';

  beforeAll(async () => {
    // Limpiar base de datos
    await request(API_URL).delete('/api/likes/test/cleanup');
  });

  afterAll(async () => {
    await request(API_URL).delete('/api/likes/test/cleanup');
  });

  it('debe mostrar 0 al inicio y actualizarse al dar like', async () => {
    // 1. Renderizar componente (debe mostrar 0)
    const { rerender } = render(<GlobalCounter refreshTrigger={0} />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('0');
    });

    // 2. Dar like a una película desde backend
    await request(API_URL).post('/api/likes/tt0111161');

    // 3. Forzar actualización del componente
    rerender(<GlobalCounter refreshTrigger={1} />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('1');
    });

    // 4. Dar otro like
    await request(API_URL).post('/api/likes/tt0068646');
    rerender(<GlobalCounter refreshTrigger={2} />);

    await waitFor(() => {
      expect(screen.getByTestId('total-likes-value')).toHaveTextContent('2');
    });
  });

  it('debe sincronizarse con múltiples usuarios dando likes', async () => {
    const { rerender } = render(<GlobalCounter refreshTrigger={0} />);

    // Simular 10 usuarios dando likes concurrentemente
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request(API_URL).post(`/api/likes/tt000000${i}`));
    }

    await Promise.all(promises);

    // Actualizar componente
    rerender(<GlobalCounter refreshTrigger={Date.now()} />);

    await waitFor(() => {
      const value = parseInt(screen.getByTestId('total-likes-value').textContent || '0');
      expect(value).toBeGreaterThanOrEqual(10);
    });
  });
});
```

---

## ✅ EJECUCIÓN Y VALIDACIÓN

### 📋 Checklist Completo

#### Backend Tests:
```bash
cd movie-bff
npm test -- likesTotal.test.ts
```
- [ ] ✅ Todos los tests pasan (mínimo 8/8)
- [ ] ✅ Coverage >80% en likeController.ts
- [ ] ✅ Coverage >80% en likeModel.ts
- [ ] ✅ Tiempo de respuesta <100ms con 1000 películas

#### Frontend Tests:
```bash
cd movie-webapp
npm run test:run
```
- [ ] ✅ Todos los tests pasan (mínimo 12/12)
- [ ] ✅ Coverage >80% en GlobalCounter.tsx
- [ ] ✅ No hay errores en consola
- [ ] ✅ Componente renderiza correctamente

#### Integración E2E:
- [ ] ✅ Backend corriendo en puerto 3000
- [ ] ✅ Frontend corriendo en puerto 3002
- [ ] ✅ Base de datos PostgreSQL activa
- [ ] ✅ Tests de integración pasan

---

## 🎯 Resultado Esperado

### Terminal Backend (npm test):
```
PASS  src/__tests__/likesTotal.test.ts
  GET /api/likes/total - Contador Global de Likes
    ✅ Casos de éxito
      ✓ debe retornar 0 cuando no hay likes (45ms)
      ✓ debe retornar el total correcto con una sola película (38ms)
      ✓ debe sumar correctamente likes de múltiples películas (42ms)
      ✓ debe actualizarse en tiempo real (156ms)
      ✓ debe manejar grandes cantidades de likes (89ms)
    ⚡ Tests de rendimiento
      ✓ debe responder en menos de 100ms con 1000 películas (67ms)
      ⏱️ Tiempo de respuesta: 67ms
    🛡️ Tests de resiliencia
      ✓ debe mantener consistencia con operaciones concurrentes (234ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Coverage:    85.3% statements, 87.1% branches
Time:        8.234s
```

### Terminal Frontend (npm run test:run):
```
✓ src/components/GlobalCounter/GlobalCounter.test.tsx (12)
  ✅ Renderizado y estados (6)
    ✓ debe mostrar estado de carga inicialmente (123ms)
    ✓ debe mostrar el total de likes correctamente (89ms)
    ✓ debe mostrar 0 cuando no hay likes (67ms)
    ✓ debe formatear números grandes (78ms)
    ✓ debe mostrar mensaje de error cuando falla (92ms)
    ✓ debe mostrar error cuando la respuesta no es ok (84ms)
  🔄 Actualización en tiempo real (2)
    ✓ debe actualizar el contador cuando cambia refreshTrigger (145ms)
    ✓ debe llamar al endpoint correcto (56ms)
  ⚡ Rendimiento (1)
    ✓ debe renderizar rápidamente con números grandes (234ms)
    ⏱️ Tiempo de renderizado: 234ms
  🎨 Accesibilidad (1)
    ✓ debe tener atributos data-testid (45ms)

Test Files  1 passed (1)
Tests  12 passed (12)
Coverage: 89.2% statements
Duration: 3.45s
```

---

## 📝 Notas Importantes

### Backend:
- Asegúrate de que PostgreSQL esté corriendo
- Verifica que la tabla `movie_likes` exista
- Usa base de datos de test (no producción)

### Frontend:
- Configura variable `NEXT_PUBLIC_API_URL` correctamente
- Mock de fetch debe estar configurado en vitest.setup.ts
- Tests usan jsdom environment

### Integración:
- Backend y frontend deben estar corriendo
- Tests E2E requieren ambos servicios activos
- Limpiar base de datos entre tests

---

## 🎉 ¡Tarjeta Completa!

Cuando todos los tests pasen:

✅ **Backend**: Endpoint /api/likes/total funcionando  
✅ **Frontend**: Componente GlobalCounter renderizando  
✅ **Integración**: Actualización en tiempo real  
✅ **Performance**: <100ms con 1000 películas  
✅ **Coverage**: >80% en ambos proyectos  

**Estado de la tarjeta:** `DONE` ✨

---

**Fecha:** Noviembre 13, 2025  
**Proyecto:** Movie BFF + Movie WebApp  
**Tarjeta:** [F2] Test de Contador Global de Likes en Tiempo Real  
**Autor:** Equipo de Testing
