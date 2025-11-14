# 🔧 Solución: Caracteres Especiales en PowerShell

## ❓ ¿Por qué aparecen mal los caracteres?

### Ejemplo del problema:
```
✅ Esperado:  Título, Año, Género
❌ Obtenido:  TÃ­tulo, AÃ±o, GÃ©nero
```

### Causa raíz:
**Conflicto de codificación UTF-8 vs Windows-1252**

- El script `.ps1` está guardado en **UTF-8** (codificación moderna)
- PowerShell en Windows usa **Windows-1252** por defecto (codificación antigua)
- Resultado: Cada letra con acento se convierte en 2 caracteres raros

---

## 🎯 Soluciones

### ✅ Solución 1: Forzar UTF-8 en el Script (RECOMENDADO)

**Ya implementado en `ISSUE_1_TEST_SUITE.ps1`:**

```powershell
# Al inicio del script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

**Ejecutar:**
```powershell
.\ISSUE_1_TEST_SUITE.ps1
```

**Resultado:** Caracteres se verán correctamente en la mayoría de casos.

---

### ✅ Solución 2: Ejecutar con UTF-8 explícito

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; .\ISSUE_1_TEST_SUITE.ps1"
```

---

### ✅ Solución 3: Cambiar codificación de PowerShell globalmente

```powershell
# Cambiar para sesión actual
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Luego ejecutar el script
.\ISSUE_1_TEST_SUITE.ps1
```

**Para hacerlo permanente:**
```powershell
# Agregar a tu perfil de PowerShell
notepad $PROFILE

# Agregar esta línea:
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

---

### ✅ Solución 4: Script sin acentos (MÁXIMA COMPATIBILIDAD)

**Cambiar palabras con acentos:**
```powershell
# ❌ Antes
Write-Host "Título: $title"
Write-Host "Año: $year"
Write-Host "Género: $genre"

# ✅ Después
Write-Host "Titulo: $title"
Write-Host "Anio: $year"
Write-Host "Genero: $genre"
```

**Ventajas:**
- ✅ Funciona en TODOS los sistemas sin configuración
- ✅ No depende de codificación
- ✅ Compatible con Windows XP hasta Windows 11

**Desventajas:**
- ❌ Menos elegante (sin acentos)
- ❌ Español no correcto

---

## 🖥️ ¿En qué terminales aparecerá bien?

| Terminal | Resultado | Requiere configuración |
|----------|-----------|------------------------|
| **PowerShell 7+** | ✅ Bien | No (UTF-8 por defecto) |
| **PowerShell 5.1 (Windows)** | ⚠️ Mal | Sí (forzar UTF-8) |
| **Windows Terminal** | ✅ Bien | No (UTF-8 por defecto) |
| **CMD** | ❌ Mal | No compatible |
| **VS Code Terminal** | ✅ Bien | No (UTF-8 por defecto) |
| **Git Bash** | ✅ Bien | No (UTF-8 por defecto) |
| **Linux/Mac Terminal** | ✅ Bien | No (UTF-8 por defecto) |

---

## 🧪 Probar la solución

### Test 1: Verificar codificación actual
```powershell
[Console]::OutputEncoding
```

**Resultado esperado:**
```
BodyName          : utf-8
EncodingName      : Unicode (UTF-8)
```

---

### Test 2: Probar caracteres especiales
```powershell
Write-Host "Título: The Shawshank Redemption"
Write-Host "Año: 1994"
Write-Host "Género: Drama"
```

**Si se ve mal:**
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "Título: The Shawshank Redemption"
Write-Host "Año: 1994"
Write-Host "Género: Drama"
```

---

### Test 3: Ejecutar el script de pruebas
```powershell
# Con UTF-8 forzado (ya incluido en el script)
.\ISSUE_1_TEST_SUITE.ps1

# Verificar salida
# Si aún se ve mal, usar Solución 4 (sin acentos)
```

---

## 📊 Comparación de soluciones

| Solución | Compatibilidad | Elegancia | Complejidad |
|----------|----------------|-----------|-------------|
| **1. UTF-8 en script** | 80% | Alta | Baja |
| **2. Comando explícito** | 90% | Alta | Media |
| **3. Perfil global** | 95% | Alta | Alta |
| **4. Sin acentos** | 100% | Baja | Baja |

---

## 🎯 Recomendación

### Para desarrollo local:
**✅ Solución 1 + Solución 3**
- Forzar UTF-8 en el script
- Configurar perfil de PowerShell

### Para compartir con otros:
**✅ Solución 4**
- Script sin acentos
- Funciona en TODOS los sistemas sin configuración

### Para CI/CD:
**✅ Solución 2**
- Comando explícito con UTF-8
- Control total sobre el entorno

---

## 🔍 Verificar archivo JSON (API Response)

**Los datos de la API siempre estarán correctos:**

```powershell
# Probar endpoint directamente
$response = Invoke-RestMethod http://localhost:3000/api/movies
$response.data[0] | ConvertTo-Json
```

**Resultado (siempre en UTF-8):**
```json
{
  "title": "The Shawshank Redemption",
  "year": "1994",
  "genre": "Drama"
}
```

✅ **Los caracteres especiales en el JSON SIEMPRE se verán bien** porque:
- JSON usa UTF-8 por estándar
- Los navegadores/Postman interpretan UTF-8 correctamente
- Solo PowerShell tiene este problema de visualización

---

## 🆘 Troubleshooting

### Problema: UTF-8 forzado pero aún se ve mal

**Causa:** Editor guardó el archivo en Windows-1252

**Solución:**
```powershell
# En VS Code:
# 1. Abrir ISSUE_1_TEST_SUITE.ps1
# 2. Abajo a la derecha, click en "Windows 1252"
# 3. Seleccionar "Save with Encoding"
# 4. Elegir "UTF-8"
# 5. Guardar archivo
```

---

### Problema: PowerShell 5.1 no reconoce UTF-8

**Solución:** Actualizar a PowerShell 7+
```powershell
# Instalar PowerShell 7
winget install --id Microsoft.Powershell --source winget
```

---

### Problema: En producción se ven mal

**Solución:** Usar API REST directamente (no terminal)
- Frontend consume JSON (siempre UTF-8 ✅)
- Postman/Insomnia (siempre UTF-8 ✅)
- cURL (UTF-8 por defecto ✅)

**La terminal PowerShell es solo para desarrollo/testing**

---

## 📝 Resumen

### El problema NO afecta:
- ✅ Respuestas JSON de la API
- ✅ Datos almacenados en PostgreSQL
- ✅ Frontend (navegador)
- ✅ Postman/Insomnia
- ✅ cURL

### El problema SOLO afecta:
- ⚠️ Visualización en PowerShell 5.1
- ⚠️ Output de scripts `.ps1` con acentos

### Solución definitiva:
**Usar script sin acentos** (`ISSUE_1_TEST_SUITE.ps1` actualizado) o **PowerShell 7+**

---

**Autores:** Manuel Martinez & Wílmer E. León  
**Fecha:** Noviembre 2025  
**Relacionado:** Issue #1 - Test Suite
