import { env } from "$env/dynamic/private";
import { Resend } from "resend";

interface PasswordResetEmail {
  to: string;
  resetUrl: string;
  recipientName?: string | null;
}

function requiredEnv(name: "RESEND_API_KEY" | "RESEND_FROM_EMAIL"): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be configured before sending email`);
  }

  return value;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  recipientName,
}: PasswordResetEmail): Promise<void> {
  const resend = new Resend(requiredEnv("RESEND_API_KEY"));
  const greeting = recipientName?.trim() ? `Bonjour ${recipientName.trim()},` : "Bonjour,";
  const escapedGreeting = escapeHtml(greeting);
  const escapedResetUrl = escapeHtml(resetUrl);

  const { error } = await resend.emails.send({
    from: requiredEnv("RESEND_FROM_EMAIL"),
    to,
    subject: "Réinitialisez votre mot de passe PEMD360",
    text: `${greeting}\n\nVous avez demandé à réinitialiser votre mot de passe PEMD360.\n\n${resetUrl}\n\nCe lien expire dans une heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 560px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 24px;">Réinitialisation du mot de passe</h1>
        <p>${escapedGreeting}</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe PEMD360.</p>
        <p style="margin: 28px 0;">
          <a href="${escapedResetUrl}" style="background: #009966; border-radius: 8px; color: #ffffff; display: inline-block; font-weight: 600; padding: 12px 20px; text-decoration: none;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien expire dans une heure.</p>
        <p style="color: #6b7280; font-size: 14px;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend could not send the password reset email: ${error.message}`);
  }
}
