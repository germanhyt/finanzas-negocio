// Store en memoria para datos en tiempo real (actualizado vía webhook)
import type { Transaccion } from './types';

interface Store {
  transacciones: Transaccion[];
  lastUpdate: Date | null;
  subscribers: Set<(data: Transaccion[]) => void>;
}

const store: Store = {
  transacciones: [],
  lastUpdate: null,
  subscribers: new Set(),
};

export function setTransacciones(data: Transaccion[]) {
  store.transacciones = data;
  store.lastUpdate = new Date();
  notifySubscribers();
}

export function addTransaccion(transaccion: Transaccion) {
  // Evitar duplicados por número de operación
  const existe = store.transacciones.some(
    (t) => t.Num_Operacion === transaccion.Num_Operacion
  );
  
  if (!existe) {
    store.transacciones.unshift(transaccion);
    store.lastUpdate = new Date();
    notifySubscribers();
  }
}

export function getTransaccionesCache(): Transaccion[] {
  return store.transacciones;
}

export function getLastUpdate(): Date | null {
  return store.lastUpdate;
}

export function subscribe(callback: (data: Transaccion[]) => void) {
  store.subscribers.add(callback);
  return () => store.subscribers.delete(callback);
}

function notifySubscribers() {
  store.subscribers.forEach((callback) => {
    callback(store.transacciones);
  });
}
