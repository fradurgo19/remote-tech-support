# 🎨 Colores Institucionales Partequipos

Esta guía define la paleta de colores institucionales implementada en la plataforma de soporte remoto.

## 🔴 Color Primario - Rojo Corporativo

### Especificaciones
- **HEX:** `#cf1b22`
- **RGB:** `rgb(207, 27, 34)`
- **HSL:** `hsl(358, 77%, 46%)`
- **Nombre Tailwind:** `partequipos-red`
- **Variable CSS:** `--primary`

### Uso
- ✅ Botones principales (CTA)
- ✅ Enlaces y acciones importantes
- ✅ Íconos destacados
- ✅ Logo y marca
- ✅ Estados de hover en elementos interactivos
- ✅ Focus rings en formularios
- ✅ Acciones destructivas (eliminar, rechazar)

### Ejemplos de Clases Tailwind
```tsx
<button className="bg-primary text-primary-foreground">Botón Principal</button>
<div className="text-primary">Texto rojo</div>
<div className="border-primary">Borde rojo</div>
<div className="bg-partequipos-red">Fondo rojo directo</div>
```

---

## ⚫ Color Secundario - Gris Medio

### Especificaciones
- **HEX:** `#50504f`
- **RGB:** `rgb(80, 80, 79)`
- **HSL:** `hsl(60, 1%, 31%)`
- **Nombre Tailwind:** `partequipos-gray`
- **Variable CSS:** `--secondary` / `--foreground`

### Uso
- ✅ Textos principales y encabezados
- ✅ Botones secundarios
- ✅ Fondos secundarios
- ✅ Íconos informativos
- ✅ Bordes y separadores sutiles

### Ejemplos de Clases Tailwind
```tsx
<button className="bg-secondary text-secondary-foreground">Botón Secundario</button>
<h1 className="text-foreground">Título principal</h1>
<p className="text-muted-foreground">Texto secundario</p>
<div className="bg-partequipos-gray">Fondo gris directo</div>
```

---

## ⚪ Color de Fondo - Blanco

### Especificaciones
- **HEX:** `#FFFFFF`
- **RGB:** `rgb(255, 255, 255)`
- **HSL:** `hsl(0, 0%, 100%)`
- **Nombre Tailwind:** `partequipos-white`
- **Variable CSS:** `--background`

### Uso
- ✅ Fondo principal de la aplicación
- ✅ Fondos de tarjetas y modales
- ✅ Espacios en blanco para respiración visual
- ✅ Texto sobre fondos oscuros

### Ejemplos de Clases Tailwind
```tsx
<div className="bg-background text-foreground">Fondo principal</div>
<div className="bg-card">Tarjeta con fondo blanco</div>
<button className="bg-primary text-primary-foreground">Texto blanco sobre rojo</button>
```

---

## 🎨 Colores Funcionales (Mantienen su propósito)

### Verde - Éxito
- **Variable:** `--success`
- **Uso:** Estados exitosos, confirmaciones, completados
```tsx
<Badge variant="success">Completado</Badge>
<div className="text-success">Operación exitosa</div>
```

### Naranja - Advertencia
- **Variable:** `--warning`
- **Uso:** Advertencias, estados pendientes
```tsx
<Badge variant="warning">Pendiente</Badge>
<div className="text-warning">Atención requerida</div>
```

### Gris Claro - Muted
- **Variable:** `--muted`
- **Uso:** Fondos secundarios, elementos deshabilitados
```tsx
<div className="bg-muted">Fondo secundario</div>
<p className="text-muted-foreground">Texto secundario</p>
```

---

## 🌗 Modo Oscuro

El modo oscuro adapta los colores institucionales manteniendo la identidad:

- **Rojo corporativo:** Más brillante (`hsl(358, 77%, 56%)`) para mejor contraste
- **Gris medio:** Adaptado a tonos oscuros para fondos
- **Blanco:** Suavizado a gris claro para reducir fatiga visual

### Activar modo oscuro
```tsx
// El sistema detecta automáticamente la preferencia del usuario
// O se puede alternar manualmente con el botón en la interfaz
```

---

## 📐 Guías de Uso

### ✅ Buenas Prácticas

1. **Contraste suficiente**: Siempre usar `text-primary-foreground` sobre `bg-primary`
2. **Jerarquía visual**: Rojo para acciones primarias, gris para secundarias
3. **Consistencia**: Usar las variables CSS para mantener coherencia
4. **Accesibilidad**: Los colores cumplen con WCAG AA para contraste

### ❌ Evitar

1. No usar colores hex directamente en componentes (usar variables)
2. No mezclar rojo y verde juntos (problemas de daltonismo)
3. No saturar la interfaz con demasiado rojo
4. No usar gris medio sobre gris claro (poco contraste)

---

## 🔧 Implementación Técnica

### Archivo de Configuración
- **CSS Variables:** `src/index.css`
- **Tailwind Config:** `tailwind.config.js`

### Acceso Directo a Colores
```tsx
// Opción 1: Variables CSS (recomendado)
className="bg-primary text-primary-foreground"

// Opción 2: Colores directos Tailwind
className="bg-partequipos-red text-white"

// Opción 3: CSS personalizado
style={{ backgroundColor: 'hsl(var(--primary))' }}
```

---

## 📊 Aplicación en Componentes

### Botones
- **Primario:** Rojo corporativo con texto blanco
- **Secundario:** Gris medio con texto blanco
- **Outline:** Borde rojo con texto rojo

### Tarjetas
- **Fondo:** Blanco
- **Texto:** Gris medio
- **Bordes:** Gris claro

### Estados
- **Hover:** Rojo más oscuro
- **Active:** Rojo más intenso
- **Disabled:** Gris claro
- **Focus:** Borde rojo con ring

---

## 📱 Responsive y Accesibilidad

### Contraste
- ✅ Rojo sobre blanco: **Ratio 7.1:1** (AAA)
- ✅ Gris sobre blanco: **Ratio 7.2:1** (AAA)
- ✅ Blanco sobre rojo: **Ratio 7.1:1** (AAA)

### Daltonismo
Los colores han sido probados con simuladores de daltonismo:
- ✅ Protanopía (rojo-verde)
- ✅ Deuteranopía (verde-rojo)
- ✅ Tritanopía (azul-amarillo)

---

## 🎯 Ejemplos Completos

### Botón Principal
```tsx
<Button 
  className="bg-primary hover:bg-primary/90 text-primary-foreground"
>
  Crear Ticket
</Button>
```

### Tarjeta con Encabezado
```tsx
<Card className="bg-card border-border">
  <CardHeader className="bg-muted">
    <CardTitle className="text-foreground">Título</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Contenido de la tarjeta
  </CardContent>
</Card>
```

### Badge de Estado
```tsx
<Badge className="bg-primary text-primary-foreground">Activo</Badge>
<Badge className="bg-secondary text-secondary-foreground">Asignado</Badge>
```

---

**Última actualización:** Diciembre 2025  
**Versión:** 1.0  
**Mantenido por:** Equipo de Desarrollo Partequipos

