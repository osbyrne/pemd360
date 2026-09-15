import { Context, Effect, Layer } from "effect";
import { EmailError } from "$lib/effect/errors";
import { sendPasswordResetEmailRequest, type PasswordResetEmail } from "$lib/server/email/resend";

export interface EmailService {
  readonly sendPasswordResetEmail: (input: PasswordResetEmail) => Effect.Effect<void, EmailError>;
}

export class Email extends Context.Tag("pemd360/Email")<Email, EmailService>() {}

export function makeEmailService(
  send: typeof sendPasswordResetEmailRequest = sendPasswordResetEmailRequest,
): EmailService {
  return {
    sendPasswordResetEmail: (input) =>
      Effect.tryPromise({
        try: () => send(input),
        catch: (cause) =>
          new EmailError({
            message: "L'envoi de l'e-mail a échoué",
            operation: "email.password-reset",
            cause,
          }),
      }),
  };
}

export const EmailLive = Layer.succeed(Email, makeEmailService());
