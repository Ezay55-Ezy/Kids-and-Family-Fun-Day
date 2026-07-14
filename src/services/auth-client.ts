export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export class RegisterError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'RegisterError';
    this.code = code;
    this.status = status;
  }
}

export async function registerUser(input: RegisterUserInput): Promise<RegisterResponse> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 409) {
      throw new RegisterError(
        data.error || 'An account with this email already exists.',
        'EMAIL_ALREADY_IN_USE',
        409
      );
    }

    if (response.status === 400) {
      throw new RegisterError(
        data.error || 'Validation failed. Please check your input.',
        'VALIDATION_ERROR',
        400
      );
    }

    throw new RegisterError(
      data.error || 'Something went wrong. Please try again.',
      'REGISTRATION_FAILED',
      response.status
    );
  }

  return data as RegisterResponse;
}