// Errores tipados para distinguir reglas de negocio violadas vs errores
// técnicos. Cada UI los convierte en mensajes amigables.

export class EmailAlreadyRegisteredError extends Error {
  readonly code = "EMAIL_ALREADY_REGISTERED";
  constructor() {
    super("Ya existe una cuenta con ese correo.");
  }
}

export class UserNotFoundError extends Error {
  readonly code = "USER_NOT_FOUND";
  constructor() {
    super("Usuario no encontrado.");
  }
}

export class InvalidResetTokenError extends Error {
  readonly code = "INVALID_RESET_TOKEN";
  constructor(message = "El enlace de recuperación no es válido o ya expiró.") {
    super(message);
  }
}
