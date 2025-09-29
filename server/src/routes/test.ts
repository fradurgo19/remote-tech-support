import { Router } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Endpoint para probar señales WebRTC
router.post('/test-signal', (req, res) => {
  try {
    const { to, signal, from } = req.body;

    logger.info('=== SEÑAL DE PRUEBA RECIBIDA ===');
    logger.info(`De: ${from}`);
    logger.info(`Para: ${to}`);
    logger.info(`Tipo: ${signal?.type || 'unknown'}`);
    logger.info(`SDP length: ${signal?.sdp?.length || 0}`);

    // Simular envío de señal
    res.json({
      success: true,
      message: 'Señal de prueba recibida correctamente',
      data: {
        from,
        to,
        signalType: signal?.type,
        sdpLength: signal?.sdp?.length,
      },
    });
  } catch (error) {
    logger.error('Error en test-signal:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando señal de prueba',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Endpoint para probar call-initiate
router.post('/test-call-initiate', (req, res) => {
  try {
    const { to, ticketId, from } = req.body;

    logger.info('=== CALL-INITIATE DE PRUEBA RECIBIDO ===');
    logger.info(`De: ${from}`);
    logger.info(`Para: ${to}`);
    logger.info(`Ticket: ${ticketId}`);

    res.json({
      success: true,
      message: 'Call-initiate de prueba recibido correctamente',
      data: {
        from,
        to,
        ticketId,
      },
    });
  } catch (error) {
    logger.error('Error en test-call-initiate:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando call-initiate de prueba',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
