import bcrypt from 'bcryptjs';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailAlreadyInUseError';
  }
}

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(input: RegisterUserInput) {
  const { name, email, password } = input;

  // Cost factor 12: deliberately slower than the bcrypt default (10) to
  // resist brute-force/offline attacks, while still completing in well
  // under 200ms on typical server hardware.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        // passwordHash intentionally excluded - never return it, even hashed
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new EmailAlreadyInUseError();
    }
    throw error;
  }
}
