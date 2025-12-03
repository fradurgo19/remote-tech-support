/**
 * Utilidades para manejo de avatares
 */

/**
 * Agrega un timestamp a la URL del avatar para evitar caché del navegador
 * @param avatarUrl - URL del avatar (puede ser null o undefined)
 * @returns URL con timestamp o null si no hay avatar
 */
export const addCacheBusting = (avatarUrl: string | null | undefined): string | null => {
  if (!avatarUrl) {
    return null;
  }

  // Si ya tiene parámetros de query, agregar timestamp con &
  if (avatarUrl.includes('?')) {
    return `${avatarUrl}&t=${Date.now()}`;
  }

  // Si no tiene parámetros, agregar con ?
  return `${avatarUrl}?t=${Date.now()}`;
};

/**
 * Procesa un objeto usuario agregando cache-busting al avatar
 * @param user - Objeto usuario con posible campo avatar
 * @returns Usuario con avatar actualizado
 */
export const processUserAvatar = <T extends { avatar?: string | null }>(user: T): T => {
  if (!user) {
    return user;
  }

  return {
    ...user,
    avatar: user.avatar ? addCacheBusting(user.avatar) : null,
  };
};

/**
 * Procesa un array de usuarios agregando cache-busting a los avatares
 * @param users - Array de usuarios
 * @returns Array de usuarios con avatares actualizados
 */
export const processUsersAvatars = <T extends { avatar?: string | null }>(users: T[]): T[] => {
  return users.map(user => processUserAvatar(user));
};

