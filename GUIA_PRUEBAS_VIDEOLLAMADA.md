# 🎥 Guía Completa de Pruebas de Videollamada

## 📋 Lista de Verificación de Funcionalidades

### **1. Configuración Inicial**

#### **Usuario 1 (Cliente - PruebasUsers)**
- [ ] Abrir navegador (Chrome recomendado)
- [ ] Ir a `http://localhost:5173`
- [ ] Login con `pruebasuser@example.com` / `admin123`
- [ ] Verificar Socket Debug Info en esquina superior derecha:
  - ✅ Connected
  - ✅ Server Available
  - ✅ Token

#### **Usuario 2 (Técnico - Juan Técnico)**
- [ ] Abrir navegador diferente o pestaña de incógnito
- [ ] Ir a `http://localhost:5173`
- [ ] Login con `juan@example.com` / `admin123`
- [ ] Verificar Socket Debug Info

---

### **2. Preparación del Ticket**

- [ ] Ambos usuarios deben abrir el **mismo ticket**
- [ ] Ir a "Mis Tickets" o "Todos los Tickets"
- [ ] Seleccionar un ticket donde:
  - Cliente: `PruebasUsers`
  - Técnico: `Juan Técnico`
- [ ] Verificar que la información del destinatario se muestre correctamente

---

### **3. Prueba Básica - Llamada Simple**

#### **Escenario A: Cliente llama a Técnico**

**Cliente (PruebasUsers):**
1. [ ] Click en "Iniciar Llamada"
2. [ ] Verificar que el botón cambie a "Llamando..."
3. [ ] Verificar que tu video local se muestre
4. [ ] Verificar permisos de cámara/micrófono si se solicitan

**Técnico (Juan Técnico):**
1. [ ] Debe aparecer modal "Llamada Entrante"
2. [ ] Debe mostrar: "PruebasUsers te está llamando"
3. [ ] [ ] Click en "Aceptar"
4. [ ] Verificar que se muestre:
   - ✅ Tu video local
   - ✅ Video del cliente remoto
5. [ ] Verificar controles:
   - 🎤 Silenciar/Activar micrófono
   - 📹 Activar/Desactivar cámara
   - 🖥️ Compartir pantalla
   - 📞 Colgar

**Ambos Usuarios:**
- [ ] Verificar que el video sea fluido
- [ ] Verificar que el audio funcione (si tienen micrófono)
- [ ] Probar silenciar/activar micrófono
- [ ] Probar desactivar/activar cámara

#### **Escenario B: Técnico llama a Cliente**

**Técnico (Juan Técnico):**
1. [ ] Click en "Iniciar Llamada"
2. [ ] Verificar que se inicie la llamada

**Cliente (PruebasUsers):**
1. [ ] Debe aparecer modal "Llamada Entrante"
2. [ ] [ ] Click en "Aceptar"
3. [ ] Verificar videos

---

### **4. Prueba de Rechazo de Llamada**

**Usuario 1:**
1. [ ] Iniciar llamada

**Usuario 2:**
1. [ ] [ ] Click en "Rechazar"
2. [ ] Verificar que el modal desaparezca
3. [ ] Verificar que no se establezca conexión

**Usuario 1:**
1. [ ] Verificar que reciba notificación de rechazo
2. [ ] Verificar que el botón vuelva a "Iniciar Llamada"

---

### **5. Prueba de Cámara Compartida (Mismo Dispositivo)**

Esta es una prueba crítica para verificar la solución de cámara compartida.

**Configuración:**
1. [ ] Abrir 2 pestañas en el mismo navegador
2. [ ] Pestaña 1: Login como Cliente
3. [ ] Pestaña 2: Login como Técnico
4. [ ] Ambas pestañas: Abrir el mismo ticket

**Prueba:**
1. **Pestaña 1 (Cliente):**
   - [ ] Click en "Iniciar Llamada"
   - [ ] Verificar que la cámara se active

2. **Pestaña 2 (Técnico):**
   - [ ] Click en "Aceptar"
   - [ ] **Esperado:** Debe aceptar con solo audio o stream vacío
   - [ ] **NO debe mostrar error** de cámara en uso
   - [ ] Verificar que se muestre mensaje: "Cámara no disponible - Solo audio"

**Resultados Esperados:**
- ✅ La llamada se establece correctamente
- ✅ NO hay errores de `NotReadableError`
- ✅ El usuario sin cámara puede participar con audio
- ✅ La llamada no se interrumpe

---

### **6. Prueba de Compartir Pantalla**

**Usuario 1:**
1. [ ] Durante una llamada activa, click en "Compartir Pantalla"
2. [ ] Seleccionar ventana/pestaña/pantalla completa
3. [ ] Verificar que tu video cambie a la pantalla compartida

**Usuario 2:**
1. [ ] Verificar que veas la pantalla compartida del otro usuario
2. [ ] Verificar que sea fluida y clara

**Usuario 1:**
1. [ ] Click en "Detener Compartir" para volver a la cámara

---

### **7. Prueba de Múltiples Pestañas/Dispositivos**

**Configuración:**
1. [ ] Usuario 1: Abrir 2 pestañas con el mismo login
2. [ ] Usuario 2: Iniciar llamada

**Verificar:**
- [ ] El modal de llamada entrante debe aparecer en **ambas pestañas** del Usuario 1
- [ ] Aceptar en una pestaña debe cerrar el modal en la otra
- [ ] La señalización WebRTC debe llegar a todas las sesiones

---

### **8. Prueba de Finalización de Llamada**

**Escenario A: Usuario que inició la llamada cuelga**
1. [ ] Usuario 1 inicia llamada
2. [ ] Usuario 2 acepta
3. [ ] Usuario 1 hace click en "Colgar"
4. [ ] **Verificar:**
   - ✅ Ambos usuarios vuelven al estado inicial
   - ✅ Videos se detienen
   - ✅ Botón vuelve a "Iniciar Llamada"

**Escenario B: Usuario que recibió la llamada cuelga**
1. [ ] Usuario 1 inicia llamada
2. [ ] Usuario 2 acepta
3. [ ] Usuario 2 hace click en "Colgar"
4. [ ] **Verificar lo mismo que Escenario A**

---

### **9. Prueba de Errores y Casos Extremos**

#### **A. Llamarse a Sí Mismo**
1. [ ] Usuario intenta llamarse a sí mismo
2. [ ] **Esperado:** Mensaje de error "No puedes llamarte a ti mismo"
3. [ ] **Esperado:** Botón deshabilitado

#### **B. Sin Destinatario Válido**
1. [ ] Abrir ticket sin técnico asignado (o sin cliente)
2. [ ] **Esperado:** Mensaje "No hay destinatario disponible"
3. [ ] **Esperado:** Botón deshabilitado

#### **C. Permisos de Cámara Denegados**
1. [ ] Bloquear permisos de cámara en el navegador
2. [ ] Intentar iniciar llamada
3. [ ] **Esperado:** Mensaje de error apropiado
4. [ ] **Esperado:** Opción de continuar solo con audio

#### **D. Socket Desconectado**
1. [ ] Detener el servidor (Ctrl+C en terminal del servidor)
2. [ ] Intentar iniciar llamada
3. [ ] **Esperado:** Error de conexión
4. [ ] Reiniciar servidor
5. [ ] **Esperado:** Reconexión automática

---

### **10. Prueba de Rendimiento**

**Calidad de Video:**
- [ ] Video fluido sin cortes (>15 FPS)
- [ ] Audio sincronizado con video
- [ ] Latencia < 2 segundos

**Uso de Recursos:**
- [ ] Abrir DevTools → Performance
- [ ] Verificar que CPU < 80%
- [ ] Verificar que memoria no aumente constantemente

---

## 🐛 Problemas Comunes y Soluciones

### **Problema: "Socket no conectado"**
**Solución:**
1. Verificar que el servidor esté corriendo: `cd server && npm run dev`
2. Verificar que el frontend esté corriendo: `npm run dev`
3. Verificar Socket Debug Info
4. Si es necesario, recargar la página

### **Problema: "Cannot access media devices"**
**Solución:**
1. Dar permisos de cámara/micrófono al navegador
2. Verificar que no haya otra app usando la cámara
3. En Chrome: chrome://settings/content/camera
4. Probar con solo audio si la cámara falla

### **Problema: "NotReadableError: Could not start video source"**
**Solución:**
- ✅ **Ya corregido** con la solución de cámara compartida
- La llamada debe aceptarse con solo audio
- No debe mostrar error crítico

### **Problema: "Llamada entrante no aparece"**
**Solución:**
1. Verificar logs del servidor
2. Verificar que ambos usuarios estén en el mismo ticket
3. Verificar que los sockets estén conectados
4. Revisar consola del navegador para errores

---

## 📊 Registro de Pruebas

### **Fecha:** _______________________
### **Navegadores Probados:**
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

### **Escenarios Completados:**
- [ ] Llamada básica cliente → técnico
- [ ] Llamada básica técnico → cliente
- [ ] Rechazo de llamada
- [ ] Cámara compartida (mismo dispositivo)
- [ ] Compartir pantalla
- [ ] Múltiples pestañas
- [ ] Finalización de llamada
- [ ] Casos de error

### **Notas Adicionales:**
```
(Agregar cualquier observación, error encontrado, o mejora sugerida)
```

---

## ✅ Criterios de Aceptación

La videollamada se considera **completamente funcional** cuando:

1. ✅ Se puede iniciar llamada desde cliente y técnico
2. ✅ Las llamadas entrantes se reciben correctamente
3. ✅ El video y audio funcionan en ambas direcciones
4. ✅ Los controles (mute, video, pantalla) funcionan
5. ✅ La cámara compartida no genera errores
6. ✅ Las llamadas se finalizan correctamente
7. ✅ Los casos de error se manejan apropiadamente
8. ✅ La UX es clara y intuitiva

---

## 🚀 Siguientes Pasos

Una vez completadas todas las pruebas:
1. Documentar cualquier bug encontrado
2. Implementar mejoras de UX
3. Agregar soporte para múltiples cámaras
4. Optimizar rendimiento
5. Preparar para producción
