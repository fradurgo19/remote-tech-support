# Remote Tech Support System

Sistema de soporte técnico remoto con capacidades de videollamadas, chat en tiempo real y gestión de tickets.

## 🚀 Características

- **Videollamadas WebRTC**: Comunicación de video y audio en tiempo real
- **Chat en tiempo real**: Mensajería instantánea con Socket.IO
- **Gestión de tickets**: Sistema completo de tickets de soporte
- **Autenticación segura**: JWT con hash de contraseñas
- **Dashboard administrativo**: Panel de control para administradores
- **Sistema de reportes**: Generación de reportes en PDF
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Gestión de usuarios**: CRUD completo de usuarios

## 🛠️ Tecnologías

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)
- Socket.IO Client
- Simple Peer (WebRTC)

### Backend
- Node.js + TypeScript
- Express.js
- Sequelize ORM
- PostgreSQL
- Socket.IO
- JWT Authentication
- Winston Logger

## 📋 Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/fradurgo19/remote-tech-support.git
cd remote-tech-support
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd server
npm install
```

### 4. Configurar variables de entorno
Crear archivo `.env` en la carpeta `server`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=remote_tech_support
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
JWT_SECRET=tu_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASS=tu_password
```

### 5. Configurar la base de datos
```bash
cd server
npm run build
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npm run seed
```

## 🏃‍♂️ Ejecución

### Desarrollo

**Frontend:**
```bash
npm run dev
```

**Backend:**
```bash
cd server
npm run dev
```

### Producción

**Frontend:**
```bash
npm run build
npm run preview
```

**Backend:**
```bash
cd server
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
remote-tech-support/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios API
│   ├── context/           # Contextos de React
│   └── types/             # Tipos TypeScript
├── server/                # Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Controladores
│   │   ├── models/        # Modelos de Sequelize
│   │   ├── routes/        # Rutas de Express
│   │   ├── middleware/    # Middleware personalizado
│   │   └── config/        # Configuración
│   └── migrations/        # Migraciones de base de datos
└── docs/                  # Documentación
```

## 🔧 Scripts Disponibles

### Frontend
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Ejecutar linter

### Backend
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar en producción
- `npm run seed` - Poblar base de datos con datos de prueba

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Tickets
- `GET /api/tickets` - Obtener todos los tickets
- `POST /api/tickets` - Crear nuevo ticket
- `GET /api/tickets/:id` - Obtener ticket por ID
- `PUT /api/tickets/:id` - Actualizar ticket
- `DELETE /api/tickets/:id` - Eliminar ticket

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Frank Duran** - [@fradurgo19](https://github.com/fradurgo19)

- LinkedIn: [Frank Anderson Duran Gonzalez](https://www.linkedin.com/in/frank-anderson-duran-gonzalez/)
- Email: fradurgo19@gmail.com

## 🙏 Agradecimientos

- A todos los contribuidores que han ayudado a mejorar este proyecto
- A la comunidad de desarrolladores por las librerías y herramientas utilizadas
