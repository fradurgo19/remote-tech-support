# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto Remote Tech Support! 🎉

## 🚀 Cómo Contribuir

### 1. Fork del Proyecto
- Haz fork del repositorio en GitHub
- Clona tu fork localmente:
```bash
git clone https://github.com/tu-usuario/remote-tech-support.git
cd remote-tech-support
```

### 2. Configurar el Entorno de Desarrollo
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### 3. Crear una Rama
```bash
git checkout -b feature/nombre-de-tu-feature
# o
git checkout -b fix/descripcion-del-bug
```

### 4. Hacer Cambios
- Realiza tus cambios siguiendo las convenciones del proyecto
- Asegúrate de que el código pase los linters
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación si es necesario

### 5. Commit y Push
```bash
git add .
git commit -m "feat: descripción de tu cambio"
git push origin feature/nombre-de-tu-feature
```

### 6. Crear Pull Request
- Ve a GitHub y crea un Pull Request
- Describe claramente los cambios realizados
- Menciona cualquier issue relacionado

## 📋 Convenciones

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `docs:` cambios en documentación
- `style:` cambios de formato (espacios, etc.)
- `refactor:` refactoring de código
- `test:` agregar o modificar tests
- `chore:` cambios en herramientas, configuración, etc.

### Código
- Usa TypeScript para tipado fuerte
- Sigue las reglas de ESLint configuradas
- Usa Prettier para formateo de código
- Escribe comentarios en inglés
- Usa nombres descriptivos para variables y funciones

### Estructura de Archivos
```
src/
├── components/     # Componentes reutilizables
├── pages/         # Páginas de la aplicación
├── services/      # Servicios API
├── context/       # Contextos de React
├── types/         # Tipos TypeScript
└── utils/         # Utilidades
```

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd server
npm test
```

## 🐛 Reportar Bugs

1. Verifica que el bug no haya sido reportado anteriormente
2. Crea un issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, navegador, versión)

## 💡 Sugerir Mejoras

1. Crea un issue con la etiqueta "enhancement"
2. Describe la mejora propuesta
3. Explica por qué sería útil
4. Si es posible, proporciona ejemplos de implementación

## 📝 Documentación

- Mantén el README actualizado
- Documenta nuevas APIs
- Agrega comentarios JSDoc para funciones complejas
- Actualiza la documentación de configuración

## 🔍 Revisión de Código

### Como Autor
- Mantén PRs pequeños y enfocados
- Responde a los comentarios de revisión
- Actualiza el PR según sea necesario

### Como Revisor
- Sé constructivo y respetuoso
- Enfócate en el código, no en la persona
- Sugiere mejoras específicas
- Aproba cuando esté listo

## 📞 Contacto

Si tienes preguntas:
- Crea un issue en GitHub
- Contacta a [@fradurgo19](https://github.com/fradurgo19)
- Email: fradurgo19@gmail.com

## 📄 Licencia

Al contribuir, aceptas que tu código será licenciado bajo la [MIT License](LICENSE).

¡Gracias por contribuir! 🙏
