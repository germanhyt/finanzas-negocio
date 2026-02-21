import { useEffect, useMemo, useRef, useState } from 'react';
import type { Transaccion } from '../lib/types';

interface LatestNotificationsProps {
  transacciones: Transaccion[];
  maxItems?: number;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'finanzas-notifications-sound-enabled';

function playNotificationSound() {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return;
  }

  const audioContext = new window.AudioContext();

  const createStrike = (startTime: number, intensity = 1) => {
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.6 * intensity, startTime + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.05);
    masterGain.connect(audioContext.destination);

    const partials = [
      { freq: 1046.5, gain: 0.9 },
      { freq: 1318.5, gain: 0.6 },
      { freq: 1568.0, gain: 0.4 },
    ];

    partials.forEach((partial) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(partial.freq, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(partial.freq * 0.92, startTime + 1.05);

      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(partial.gain, startTime + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.05);

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + 1.05);
    });
  };

  const startTime = audioContext.currentTime;
  createStrike(startTime, 1);
  createStrike(startTime + 0.28, 0.8);

  window.setTimeout(() => {
    audioContext.close().catch(() => undefined);
  }, 1800);
}

export function LatestNotifications({
  transacciones,
  maxItems = 6,
  storageKey = DEFAULT_STORAGE_KEY,
}: LatestNotificationsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const initializedRef = useRef(false);
  const knownOperationsRef = useRef<Set<string>>(new Set());

  const latestItems = useMemo(() => {
    return transacciones.slice(0, maxItems);
  }, [transacciones, maxItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedValue = window.localStorage.getItem(storageKey);
    if (savedValue === 'false') {
      setSoundEnabled(false);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!initializedRef.current) {
      knownOperationsRef.current = new Set(
        transacciones.map((tx) => tx.Num_Operacion).filter(Boolean)
      );
      initializedRef.current = true;
      return;
    }

    const newOperations = transacciones.filter((tx) => {
      const operationNumber = tx.Num_Operacion;
      return operationNumber && !knownOperationsRef.current.has(operationNumber);
    });

    if (newOperations.length > 0 && soundEnabled) {
      playNotificationSound();
    }

    newOperations.forEach((tx) => {
      if (tx.Num_Operacion) {
        knownOperationsRef.current.add(tx.Num_Operacion);
      }
    });
  }, [transacciones, soundEnabled]);

  const handleToggleSound = () => {
    setSoundEnabled((previousValue) => {
      const nextValue = !previousValue;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, String(nextValue));
      }
      return nextValue;
    });
  };

  return (
    <div className="notifications-bell" aria-live="polite">
      <button
        type="button"
        className="notifications-bell-button"
        onClick={() => setIsOpen((previousValue) => !previousValue)}
        aria-expanded={isOpen}
        aria-label="Abrir notificaciones"
      >
        🔔
      </button>

      {isOpen && (
        <section className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Últimas notificaciones</h3>
            <button
              type="button"
              className={`sound-toggle ${soundEnabled ? 'enabled' : 'disabled'}`}
              onClick={handleToggleSound}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
            </button>
          </div>

          {latestItems.length === 0 ? (
            <p className="notifications-empty">Aún no hay notificaciones recientes.</p>
          ) : (
            <ul className="notifications-list">
              {latestItems.map((tx) => (
                <li key={tx.Num_Operacion || `${tx.Fecha}-${tx.Hora}-${tx.Monto}`} className="notification-item">
                  <div className="notification-main">
                    <strong>{tx.Tipo || 'Movimiento'}</strong>
                    <span className="notification-meta">{tx.Fecha} {tx.Hora}</span>
                  </div>
                  <div className="notification-sub">
                    <span>{tx.Destinatario || 'Sin destinatario'}</span>
                    <span className={`notification-amount ${tx.Tipo?.toLowerCase().includes('egreso') ? 'egreso' : 'ingreso'}`}>
                      S/ {Number(tx.Monto || 0).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
