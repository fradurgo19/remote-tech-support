import { Request, Response } from 'express';
import {
  findBusinessPartnersByNitOrName,
  getRecentPurchasesByCardCode,
  isSapConfigured,
} from '../services/sap.service';
import { logger } from '../utils/logger';

function queryParamString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
    return value[0];
  }
  return '';
}

/**
 * GET /api/purchases/search?nit=... | ?name=...
 * Solo admin y técnico. Devuelve clientes SAP por NIT o nombre y últimas compras del primero.
 */
export async function searchPurchasesByNitOrName(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!isSapConfigured()) {
      res.status(503).json({
        message:
          'Búsqueda de compras no disponible: SAP no configurado. Configure SAP_SERVICE_LAYER_URL, SAP_COMPANY_DB, SAP_USERNAME y SAP_PASSWORD.',
      });
      return;
    }

    const nit = queryParamString(req.query.nit).trim();
    const name = queryParamString(req.query.name).trim();

    if (!nit && !name) {
      res.status(400).json({
        message: 'Indique NIT o nombre del cliente para buscar.',
      });
      return;
    }

    const partners = await findBusinessPartnersByNitOrName(
      nit || null,
      name || null
    );

    if (partners.length === 0) {
      res.json({
        client: null,
        purchases: [],
        message: 'No se encontraron clientes con ese NIT o nombre.',
      });
      return;
    }

    const first = partners[0];
    const purchases = await getRecentPurchasesByCardCode(first.CardCode, 20);

    res.json({
      client: {
        cardCode: first.CardCode,
        cardName: first.CardName,
        federalTaxId: first.FederalTaxId ?? null,
      },
      purchases: purchases.map(p => ({
        docEntry: p.DocEntry,
        docNum: p.DocNum,
        docDate: p.DocDate ?? null,
        docDueDate: p.DocDueDate ?? null,
        cardCode: p.CardCode,
        cardName: p.CardName,
        docTotal: p.DocTotal ?? null,
        docStatus: p.DocStatus ?? null,
      })),
    });
  } catch (err) {
    logger.error('Error en búsqueda de compras SAP:', err);
    const message =
      err instanceof Error ? err.message : 'Error al consultar compras';
    res.status(500).json({
      message: 'No se pudo consultar SAP. Intente más tarde.',
      detail: message,
    });
  }
}

/**
 * GET /api/purchases/health
 * Indica si SAP está configurado (sin probar conexión).
 */
export async function purchasesHealth(req: Request, res: Response): Promise<void> {
  res.json({
    configured: isSapConfigured(),
  });
}
