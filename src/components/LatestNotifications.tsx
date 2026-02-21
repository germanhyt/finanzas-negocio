import { useEffect, useMemo, useRef, useState } from 'react';
import type { Transaccion } from '../lib/types';

interface LatestNotificationsProps {
  transacciones: Transaccion[];
  maxItems?: number;
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'finanzas-notifications-sound-enabled';

async function playNotificationSound(audioContext: AudioContext) {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const now = audioContext.currentTime;

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

  const startTime = now;
  createStrike(startTime, 1);
  createStrike(startTime + 0.28, 0.8);
}

export function LatestNotifications({
  transacciones,
  maxItems = 6,
  storageKey = DEFAULT_STORAGE_KEY,
}: LatestNotificationsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isBellVibrating, setIsBellVibrating] = useState(false);
  const initializedRef = useRef(false);
  const knownOperationsRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const vibrationTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const getOrCreateAudioContext = () => {
    if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }

    return audioContextRef.current;
  };

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
    const unlockAudio = async () => {
      const context = getOrCreateAudioContext();
      if (!context) return;

      if (context.state === 'suspended') {
        try {
          await context.resume();
        } catch {
          return;
        }
      }
    };

    const events: Array<keyof WindowEventMap> = ['click', 'keydown', 'touchstart'];
    events.forEach((eventName) => {
      window.addEventListener(eventName, unlockAudio, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, unlockAudio);
      });

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }

      if (vibrationTimeoutRef.current !== null) {
        window.clearTimeout(vibrationTimeoutRef.current);
      }
    };
  }, []);

  const triggerBellVibration = () => {
    setIsBellVibrating(true);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([120, 70, 120]);
    }

    if (vibrationTimeoutRef.current !== null) {
      window.clearTimeout(vibrationTimeoutRef.current);
    }

    vibrationTimeoutRef.current = window.setTimeout(() => {
      setIsBellVibrating(false);
    }, 900);
  };

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
      const context = getOrCreateAudioContext();
      if (context) {
        void playNotificationSound(context).catch(() => undefined);
      }
      triggerBellVibration();
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
        className={`notifications-bell-button ${isBellVibrating ? 'vibrating' : ''}`}
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
