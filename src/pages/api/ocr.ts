import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(
                JSON.stringify({ success: false, error: 'No se envió ninguna imagen' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = import.meta.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ success: false, error: 'Falta la configuración de Gemini API Key' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Convertir File a base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }, { apiVersion: 'v1beta' });

        const prompt = `Analiza la imagen de este voucher bancario (Yape, Plin, BCP, BBVA, Interbank, Scotiabank) y extrae los siguientes datos en formato JSON puro.
        Los campos son:
        - Fecha (formato YYYY-MM-DD)
        - Hora (formato HH:MM:SS)
        - Movimiento (SOLO puede ser 'INGRESO' o 'EGRESO'. Por defecto EGRESO si es un pago)
        - Banco (Identifica el banco emisor: BCP, BBVA, INTERBANK, SCOTIABANK, YAPE, PLIN, etc.)
        - Tipo (PAGO QR, YAPEO CELULAR, TRANSFERENCIA, EFECTIVO, COMPRA, VENTA)
        - Destinatario (Nombre de la persona o entidad)
        - Monto (Número sin símbolos)
        - Num_Operacion (Código de referencia)
        - Concepto (Breve descripción si existe)

        Responde ÚNICAMENTE el objeto JSON sin bloques de código markdown ni texto adicional.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type || 'image/jpeg'
                }
            }
        ]);

        const responseText = result.response.text();

        // Limpiar posible markdown si el modelo no obedece el "solamente JSON"
        const cleanJsonString = responseText.replace(/```json|```/g, '').trim();
        const extractedData = JSON.parse(cleanJsonString);

        return new Response(
            JSON.stringify({ success: true, data: extractedData }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error en el proceso de OCR:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Error al procesar la imagen con AI',
                details: error.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
