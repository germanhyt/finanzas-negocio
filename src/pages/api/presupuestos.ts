import type { APIRoute } from 'astro';
import { addPresupuestoSheet, updatePresupuestoSheet, deletePresupuestoSheet } from '../../lib/sheets';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const action = url.searchParams.get('action');
    const data = await request.json();

    if (action === 'delete') {
      await deletePresupuestoSheet(data.id);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (action === 'update') {
      await updatePresupuestoSheet(data);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Default: create
    await addPresupuestoSheet(data);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('Error in api/presupuestos:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
