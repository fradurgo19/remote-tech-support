import { User } from '../models';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

export async function resetAllPasswords() {
  try {
    logger.info('=== RESETEANDO CONTRASEÑAS ===');
    
    const users = await User.findAll();
    logger.info(`Encontrados ${users.length} usuarios`);
    
    // Generar un solo hash para todos (más eficiente y consistente)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    logger.info(`Hash generado: ${hashedPassword.substring(0, 30)}...`);
    
    for (const user of users) {
      logger.info(`Reseteando contraseña para: ${user.name} (${user.email})`);
      
      user.password = hashedPassword;
      await user.save();
      
      logger.info(`✅ Contraseña actualizada para ${user.name}`);
    }
    
    // Recargar usuarios de la base de datos para verificar
    logger.info('\n=== VERIFICACIÓN ===');
    const updatedUsers = await User.findAll();
    let allValid = true;
    
    for (const user of updatedUsers) {
      const isValid = await bcrypt.compare('admin123', user.password);
      logger.info(`${user.name}: contraseña 'admin123' válida = ${isValid}`);
      if (!isValid) allValid = false;
    }
    
    if (allValid) {
      logger.info('✅ Todas las contraseñas han sido reseteadas y verificadas correctamente');
    } else {
      logger.warn('⚠️  Algunas contraseñas no se verificaron correctamente');
    }
  } catch (error) {
    logger.error('Error reseteando contraseñas:', error);
    throw error;
  }
}
