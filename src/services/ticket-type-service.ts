import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export class TicketTypeNotFoundError extends Error {
  constructor() {
    super('Ticket type not found.');
    this.name = 'TicketTypeNotFoundError';
  }
}

export interface CreateTicketTypeInput {
  name: string;
  description?: string;
  price: number;
  capacity: number;
  eventId: string;
}

export interface UpdateTicketTypeInput {
  name?: string;
  description?: string | null;
  price?: number;
  capacity?: number;
}

export async function listTicketTypes(eventId: string) {
  return prisma.ticketType.findMany({
    where: { eventId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTicketType(id: string) {
  const ticketType = await prisma.ticketType.findUnique({ where: { id } });
  if (!ticketType) throw new TicketTypeNotFoundError();
  return ticketType;
}

export async function createTicketType(input: CreateTicketTypeInput) {
  return prisma.ticketType.create({
    data: {
      name: input.name,
      description: input.description || null,
      price: input.price,
      capacity: input.capacity,
      eventId: input.eventId,
    },
  });
}

export async function updateTicketType(id: string, input: UpdateTicketTypeInput) {
  const existing = await prisma.ticketType.findUnique({ where: { id } });
  if (!existing) throw new TicketTypeNotFoundError();

  const data: Prisma.TicketTypeUpdateInput = {};

  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.price !== undefined) data.price = input.price;
  if (input.capacity !== undefined) data.capacity = input.capacity;

  return prisma.ticketType.update({
    where: { id },
    data,
  });
}

export async function deleteTicketType(id: string) {
  const existing = await prisma.ticketType.findUnique({ where: { id } });
  if (!existing) throw new TicketTypeNotFoundError();

  await prisma.ticketType.delete({ where: { id } });
}
