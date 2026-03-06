/**
 * Cliente para SAP Business One Service Layer (OData).
 * Usado para consultar clientes por NIT/nombre y últimas compras (documentos de venta).
 */

const SAP_REQUEST_TIMEOUT_MS = 15000;

export interface SapConfig {
  baseUrl: string;
  companyDB: string;
  username: string;
  password: string;
}

export interface SapBusinessPartner {
  CardCode: string;
  CardName: string;
  FederalTaxId?: string;
}

export interface SapSalesDocument {
  DocEntry?: number;
  DocNum?: number;
  DocDate?: string;
  DocDueDate?: string;
  CardCode?: string;
  CardName?: string;
  DocTotal?: number;
  DocStatus?: string;
}

interface SapLoginResponse {
  SessionId?: string;
  Version?: string;
  SessionTimeout?: number;
}

function getConfig(): SapConfig | null {
  const baseUrl = process.env.SAP_SERVICE_LAYER_URL?.trim();
  const companyDB = process.env.SAP_COMPANY_DB?.trim();
  const username = process.env.SAP_USERNAME?.trim();
  const password = process.env.SAP_PASSWORD;

  if (!baseUrl || !companyDB || !username || password === undefined) {
    return null;
  }

  const url = baseUrl.replace(/\/$/, '');
  return { baseUrl: url, companyDB, username, password };
}

/**
 * Realiza login en el Service Layer y devuelve la cookie de sesión.
 */
async function login(config: SapConfig): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SAP_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}/Login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CompanyDB: config.companyDB,
        UserName: config.username,
        Password: config.password,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SAP Login failed: ${res.status} ${text}`);
    }

    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) {
      const data = (await res.json()) as SapLoginResponse;
      if (data.SessionId) {
        return `B1SESSION=${data.SessionId}`;
      }
      throw new Error('SAP Login: no session cookie or SessionId');
    }

    const re = /B1SESSION=([^;]+)/;
    const exec = re.exec(setCookie);
    if (exec) return `B1SESSION=${exec[1]}`;
    throw new Error('SAP Login: B1SESSION not found in Set-Cookie');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Ejecuta una petición GET al Service Layer con la sesión dada.
 */
async function sapGet(
  config: SapConfig,
  sessionCookie: string,
  path: string
): Promise<{ value?: unknown[]; error?: { message?: { value?: string } } }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SAP_REQUEST_TIMEOUT_MS);

  try {
    const url = path.startsWith('http') ? path : `${config.baseUrl}/${path}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: sessionCookie,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();

    if (!res.ok) {
      const errMsg =
        data?.error?.message?.value ?? data?.error?.message ?? res.statusText;
      throw new Error(`SAP API ${res.status}: ${errMsg}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Busca socios de negocio por NIT (FederalTaxId) o por nombre (CardName).
 * Devuelve hasta 10 coincidencias.
 */
export async function findBusinessPartnersByNitOrName(
  nit: string | null,
  name: string | null
): Promise<SapBusinessPartner[]> {
  const config = getConfig();
  if (!config) {
    throw new Error('SAP_SERVICE_LAYER_URL not configured');
  }

  const trimmedNit = nit?.trim().replaceAll(/\s/g, '') ?? '';
  const trimmedName = name?.trim() ?? '';

  if (!trimmedNit && !trimmedName) {
    return [];
  }

  const sessionCookie = await login(config);

  const filters: string[] = [];
  if (trimmedNit) {
    filters.push(`contains(FederalTaxId,'${encodeODataString(trimmedNit)}')`);
  }
  if (trimmedName) {
    filters.push(`contains(CardName,'${encodeODataString(trimmedName)}')`);
  }

  const filterQuery = filters.length > 0 ? filters.join(' or ') : '';
  let path = 'BusinessPartners?$select=CardCode,CardName,FederalTaxId&$top=10';
  if (filterQuery) {
    path += `&$filter=${encodeURIComponent(filterQuery)}`;
  }

  const data = await sapGet(config, sessionCookie, path);
  const value = data.value as SapBusinessPartner[] | undefined;
  return Array.isArray(value) ? value : [];
}

/**
 * Obtiene los últimos documentos de venta (Invoices) de un cliente por CardCode.
 */
export async function getRecentPurchasesByCardCode(
  cardCode: string,
  top: number = 20
): Promise<SapSalesDocument[]> {
  const config = getConfig();
  if (!config) {
    throw new Error('SAP_SERVICE_LAYER_URL not configured');
  }

  const code = encodeODataString(cardCode.trim());
  if (!code) return [];

  const sessionCookie = await login(config);

  const path = `Invoices?$filter=CardCode eq '${code}'&$orderby=DocDate desc&$top=${Math.min(Math.max(1, top), 50)}&$select=DocEntry,DocNum,DocDate,DocDueDate,CardCode,CardName,DocTotal,DocStatus`;

  const data = await sapGet(config, sessionCookie, path);
  const value = data.value as SapSalesDocument[] | undefined;
  return Array.isArray(value) ? value : [];
}

function encodeODataString(value: string): string {
  return value
    .replaceAll("'", "''")
    .replaceAll('%', '%25')
    .replaceAll('?', '%3F')
    .replaceAll('#', '%23')
    .replaceAll('/', '%2F')
    .replaceAll('\\', '%5C');
}

export function isSapConfigured(): boolean {
  return getConfig() !== null;
}
