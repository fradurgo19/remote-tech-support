import { useEffect, useRef, useState } from 'react';

export const usePictureInPicture = (
  videoRef: React.RefObject<HTMLVideoElement | null>
) => {
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar si el navegador soporta PIP
    setIsSupported(
      document.pictureInPictureEnabled &&
        !!document.createElement('video').requestPictureInPicture
    );
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPIP = () => {
      console.log('📺 Entró en Picture-in-Picture');
      setIsPictureInPicture(true);
    };

    const handleLeavePIP = () => {
      console.log('📺 Salió de Picture-in-Picture');
      setIsPictureInPicture(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPIP);
    video.addEventListener('leavepictureinpicture', handleLeavePIP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPIP);
      video.removeEventListener('leavepictureinpicture', handleLeavePIP);
    };
  }, [videoRef]);

  const enterPictureInPicture = async () => {
    const video = videoRef.current;
    if (!video || !isSupported) {
      console.warn('PIP no soportado o video no disponible');
      return false;
    }

    try {
      await video.requestPictureInPicture();
      console.log('✅ PIP activado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al activar PIP:', error);
      return false;
    }
  };

  const exitPictureInPicture = async () => {
    if (!document.pictureInPictureElement) {
      console.warn('No hay elemento en PIP actualmente');
      return false;
    }

    try {
      await document.exitPictureInPicture();
      console.log('✅ PIP desactivado exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error al desactivar PIP:', error);
      return false;
    }
  };

  const togglePictureInPicture = async () => {
    if (isPictureInPicture) {
      return await exitPictureInPicture();
    } else {
      return await enterPictureInPicture();
    }
  };

  return {
    isPictureInPicture,
    isSupported,
    enterPictureInPicture,
    exitPictureInPicture,
    togglePictureInPicture,
  };
};
