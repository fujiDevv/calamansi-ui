import { NextResponse } from "next/server";
import { components } from "@/lib/components";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "calamansi_visitor_id";
let analyticsTableReady: Promise<void> | null = null;

type AnalyticsStats = {
  components: number;
  visitors: number;
  views: number;
};

async function ensureAnalyticsTable() {
  analyticsTableReady ??= getPool()
    .query(
      `
      CREATE TABLE IF NOT EXISTS analytics_page_views (
        id bigserial PRIMARY KEY,
        visitor_id text NOT NULL,
        path text NOT NULL,
        referrer text,
        user_agent text,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS analytics_page_views_created_at_idx
        ON analytics_page_views (created_at DESC);

      CREATE INDEX IF NOT EXISTS analytics_page_views_visitor_id_idx
        ON analytics_page_views (visitor_id);
    `,
    )
    .then(() => undefined);

  await analyticsTableReady;
}

async function getStats(): Promise<AnalyticsStats> {
  const { rows } = await getPool().query<{
    views: string;
    visitors: string;
  }>(`
    SELECT
      COUNT(*)::text AS views,
      COUNT(DISTINCT visitor_id)::text AS visitors
    FROM analytics_page_views;
  `);

  return {
    components: components.length,
    visitors: Number(rows[0]?.visitors ?? 0),
    views: Number(rows[0]?.views ?? 0),
  };
}

function getVisitorId(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const visitorCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${VISITOR_COOKIE}=`));

  return visitorCookie?.split("=")[1] || crypto.randomUUID();
}

function createStatsResponse(stats: AnalyticsStats, visitorId: string) {
  const response = NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function GET(request: Request) {
  await ensureAnalyticsTable();

  return createStatsResponse(await getStats(), getVisitorId(request));
}

export async function POST(request: Request) {
  const visitorId = getVisitorId(request);
  const body = (await request.json().catch(() => ({}))) as {
    path?: string;
  };
  const path = body.path?.slice(0, 300) || "/";

  await ensureAnalyticsTable();
  await getPool().query(
    `
      INSERT INTO analytics_page_views (visitor_id, path, referrer, user_agent)
      VALUES ($1, $2, $3, $4);
    `,
    [
      visitorId,
      path,
      request.headers.get("referer"),
      request.headers.get("user-agent"),
    ],
  );

  return createStatsResponse(await getStats(), visitorId);
}
