export interface TicketTypeAvailability {
  remaining: number;
  isSoldOut: boolean;
}

export function computeAvailability(
  capacity: number,
  ticketsSold: number,
): TicketTypeAvailability {
  const remaining = Math.max(0, capacity - ticketsSold);
  return {
    remaining,
    isSoldOut: remaining <= 0,
  };
}
