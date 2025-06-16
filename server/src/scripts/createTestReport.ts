import { sequelize } from '../config/database';
import Report from '../models/Report';
import { User } from '../models/User';

async function createTestReport() {
  try {
    // Asegurarse de que la base de datos esté sincronizada
    await sequelize.sync();

    // Buscar un usuario existente para usar su ID
    const user = await User.findOne();
    if (!user) {
      console.error('No se encontró ningún usuario en la base de datos.');
      return;
    }

    // Crear un informe de prueba usando el ID del usuario encontrado
    const testReport = await Report.create({
      title: 'Informe de Mantenimiento Preventivo',
      description: 'Se realizó el mantenimiento preventivo del sistema según lo programado. Se verificaron los siguientes puntos:\n\n1. Limpieza de componentes\n2. Verificación de conexiones\n3. Actualización de software\n4. Pruebas de rendimiento\n\nTodo el sistema está funcionando correctamente.',
      attachments: ['checklist_mantenimiento.pdf', 'fotos_servicio.zip'],
      userId: user.id,
    });

    console.log('Informe de prueba creado exitosamente:', testReport.toJSON());
  } catch (error) {
    console.error('Error al crear el informe de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

createTestReport(); 