import { useState, useCallback, useMemo } from 'react';

export interface TicketTypeOption {
  id: string;
  name: string;
  price: number;
  remaining: number;
}

export interface SelectionEntry {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export function useTicketSelection(ticketTypes: TicketTypeOption[]) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const setQuantity = useCallback(
    (typeId: string, value: number) => {
      const tt = ticketTypes.find((t) => t.id === typeId);
      if (!tt) return;
      const clamped = Math.max(0, Math.min(value, tt.remaining));
      setQuantities((prev) => {
        const next = { ...prev };
        if (clamped === 0) {
          delete next[typeId];
        } else {
          next[typeId] = clamped;
        }
        return next;
      });
    },
    [ticketTypes],
  );

  const increment = useCallback(
    (typeId: string) => {
      const current = quantities[typeId] ?? 0;
      setQuantity(typeId, current + 1);
    },
    [quantities, setQuantity],
  );

  const decrement = useCallback(
    (typeId: string) => {
      const current = quantities[typeId] ?? 0;
      setQuantity(typeId, current - 1);
    },
    [quantities, setQuantity],
  );

  const reset = useCallback(() => {
    setQuantities({});
  }, []);

  const selectedTypes = useMemo<SelectionEntry[]>(() => {
    return ticketTypes
      .filter((tt) => (quantities[tt.id] ?? 0) > 0)
      .map((tt) => ({
        id: tt.id,
        name: tt.name,
        quantity: quantities[tt.id] ?? 0,
        price: tt.price,
        subtotal: (quantities[tt.id] ?? 0) * tt.price,
      }));
  }, [ticketTypes, quantities]);

  const totalItems = useMemo(
    () => selectedTypes.reduce((sum, e) => sum + e.quantity, 0),
    [selectedTypes],
  );

  const totalPrice = useMemo(
    () => selectedTypes.reduce((sum, e) => sum + e.subtotal, 0),
    [selectedTypes],
  );

  return {
    quantities,
    setQuantity,
    increment,
    decrement,
    reset,
    selectedTypes,
    totalItems,
    totalPrice,
  };
}
