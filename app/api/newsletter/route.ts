import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

let newsletterTableReady: Promise<unknown> | undefined;

function ensureNewsletterTable() {
  newsletterTableReady ??= getPool().query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id bigserial PRIMARY KEY,
      email text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  return newsletterTableReady;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";

  if (!email || email.length > 320 || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    await ensureNewsletterTable();
    await getPool().query(
      `
        INSERT INTO newsletter_subscribers (email)
        VALUES ($1)
        ON CONFLICT (email) DO NOTHING;
      `,
      [email],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter subscription failed", error);
    return NextResponse.json(
      { error: "Could not subscribe right now. Please try again." },
      { status: 500 },
    );
  }
}
