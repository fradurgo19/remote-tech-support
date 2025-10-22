# Configuración de Variables de Entorno para Email

Para habilitar las notificaciones por correo electrónico, agregue las siguientes variables a su archivo `.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=soportemq@partequipos.com
SMTP_PASS=tu_contraseña_de_aplicacion_gmail_aqui

# Support Email
SUPPORT_EMAIL=soportemq@partequipos.com
```

## Configuración para Gmail

1. **Habilitar autenticación de 2 factores** en la cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ir a Configuración de Google Account
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Generar nueva contraseña para "Mail"
3. **Usar la contraseña de aplicación** en `SMTP_PASS`

## Configuración para otros proveedores

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Servidor SMTP personalizado

```env
SMTP_HOST=tu-servidor-smtp.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-usuario@empresa.com
SMTP_PASS=tu-contraseña
```
