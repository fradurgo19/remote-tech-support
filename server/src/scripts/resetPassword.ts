import { sequelize } from '../config/database';
import { User } from '../models';
import bcrypt from 'bcryptjs';

async function resetPassword() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Hashear la nueva contraseña
    const password = await bcrypt.hash('admin123', 10);

    // Actualizar la contraseña del usuario admin
    const [updated] = await User.update(
      { password },
      { where: { email: 'admin@example.com' } }
    );

    if (updated) {
      console.log('Contraseña actualizada exitosamente');
    } else {
      console.log('No se encontró el usuario admin');
    }
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  } finally {
    await sequelize.close();
  }
}

resetPassword(); 