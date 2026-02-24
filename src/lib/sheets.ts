import { google } from 'googleapis';
import { createPrivateKey } from 'node:crypto';
import type { Transaccion } from './types';

function normalizePrivateKey(rawKey: string): string {
	const withoutQuotes = rawKey
		.trim()
		.replace(/^"([\s\S]*)"$/, '$1')
		.replace(/^'([\s\S]*)'$/, '$1');

	const normalized = withoutQuotes
		.replace(/\\n/g, '\n')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.trim();

	return normalized.endsWith('\n') ? normalized : `${normalized}\n`;
}

function getValidatedPrivateKey(rawKey?: string): string {
	if (!rawKey) {
		throw new Error('Falta GOOGLE_PRIVATE_KEY en variables de entorno');
	}

	const key = normalizePrivateKey(rawKey);

	if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
		throw new Error(
			'GOOGLE_PRIVATE_KEY no tiene formato PEM válido. Usa el valor private_key del JSON de la cuenta de servicio.'
		);
	}

	try {
		createPrivateKey({ key, format: 'pem' });
	} catch {
		throw new Error(
			'GOOGLE_PRIVATE_KEY inválida o mal formateada. Verifica comillas, saltos de línea (\\n) y que la clave sea la del JSON descargado.'
		);
	}

	return key;
}

const getAuth = () => {
	const email = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
	const key = getValidatedPrivateKey(import.meta.env.GOOGLE_PRIVATE_KEY);

	if (!email) {
		throw new Error('Falta GOOGLE_SERVICE_ACCOUNT_EMAIL en variables de entorno');
	}

	return new google.auth.JWT({
		email,
		key,
		scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
	});
};

export async function getTransacciones(): Promise<Transaccion[]> {
	const auth = getAuth();
	const sheets = google.sheets({ version: 'v4', auth });
	const spreadsheetId = import.meta.env.GOOGLE_SPREADSHEET_ID;

	if (!spreadsheetId) {
		throw new Error('Falta GOOGLE_SPREADSHEET_ID en variables de entorno');
	}

	try {
		const response = await sheets.spreadsheets.values.get({
			spreadsheetId,
			range: 'DB!A1:Z',
		});

		const values = response.data.values || [];

		if (values.length === 0) {
			return [];
		}

		const [headerRow, ...rows] = values;

		const normalizedHeaders = (headerRow || []).map((header) =>
			String(header || '').trim().toUpperCase()
		);

		const columnIndex = (columnName: string) =>
			normalizedHeaders.indexOf(columnName.toUpperCase());

		const fechaIdx = columnIndex('Fecha');
		const horaIdx = columnIndex('Hora');
		const movimientoIdx = columnIndex('Movimiento');
		const conceptoIdx = columnIndex('Concepto');
		const bancoIdx = columnIndex('Banco');
		const tipoIdx = columnIndex('Tipo');
		const destinatarioIdx = columnIndex('Destinatario');
		const numOperacionIdx = columnIndex('Num_Operacion');
		const montoIdx = columnIndex('Monto');

		const getValue = (row: string[], index: number): string =>
			index >= 0 ? String(row[index] || '') : '';

		const parseMonto = (value: string): number => {
			const normalized = value.replace(/,/g, '').trim();
			return parseFloat(normalized) || 0;
		};

		return rows.map((row) => ({
			Fecha: getValue(row, fechaIdx),
			Hora: getValue(row, horaIdx),
			Movimiento: getValue(row, movimientoIdx),
			Concepto: getValue(row, conceptoIdx),
			Banco: getValue(row, bancoIdx),
			Tipo: getValue(row, tipoIdx),
			Destinatario: getValue(row, destinatarioIdx),
			Num_Operacion: getValue(row, numOperacionIdx),
			Monto: parseMonto(getValue(row, montoIdx)),
		}));
	} catch (error) {
		console.error('Error al obtener datos del Sheet:', error);
		throw error;
	}
}

export async function getTransaccionesPorFecha(
	fechaInicio?: string,
	fechaFin?: string
): Promise<Transaccion[]> {
	const transacciones = await getTransacciones();

	if (!fechaInicio && !fechaFin) {
		return transacciones;
	}

	return transacciones.filter((transaccion) => {
		const fecha = new Date(transaccion.Fecha);
		const inicio = fechaInicio ? new Date(fechaInicio) : new Date(0);
		const fin = fechaFin ? new Date(fechaFin) : new Date();
		return fecha >= inicio && fecha <= fin;
	});
}
