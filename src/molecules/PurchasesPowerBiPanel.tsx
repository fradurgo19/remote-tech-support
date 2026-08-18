import { ExternalLink } from 'lucide-react';
import React from 'react';
import { Button } from '../atoms/Button';

/** Vínculo oficial de inserción (Power BI → Insertar informe → Sitio web o portal) */
const DEFAULT_EMBED_URL =
  'https://app.powerbi.com/reportEmbed?reportId=343666f0-8a86-415d-ae4e-da288f05c0a4&autoAuth=true&ctid=26cb2c05-c882-4926-891d-27fa7b04b516&actionBarEnabled=true&reportCopilotInEmbed=true';

function resolvePowerBiEmbedUrl(): string {
  const fromEnv = (import.meta.env.VITE_POWERBI_EMBED_URL as string | undefined)?.trim();
  return fromEnv || DEFAULT_EMBED_URL;
}

const POWERBI_EMBED_URL = resolvePowerBiEmbedUrl();

/**
 * Informe Power BI (Secure Embed) para verificar compras del cliente.
 * Requiere sesión Microsoft del usuario con permiso sobre el informe.
 */
export const PurchasesPowerBiPanel: React.FC = () => (
  <div className='flex flex-col gap-2'>
    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
      <p className='text-sm text-muted-foreground'>
        Informe Power BI (Ventas Grupo Articulo): busque el cliente y verifique
        si compró. Debe estar autenticado en Microsoft 365.
      </p>
      <Button
        variant='outline'
        size='sm'
        leftIcon={<ExternalLink size={14} />}
        onClick={() => {
          window.open(POWERBI_EMBED_URL, '_blank', 'noopener,noreferrer');
        }}
      >
        Abrir en Power BI
      </Button>
    </div>
    <div className='w-full overflow-hidden rounded-md border border-border bg-background'>
      <iframe
        title='Ventas Grupo Articulo'
        src={POWERBI_EMBED_URL}
        className='w-full h-[541px] md:h-[560px] border-0'
        allowFullScreen
        loading='lazy'
        referrerPolicy='no-referrer-when-downgrade'
      />
    </div>
  </div>
);
