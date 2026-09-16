type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; error?: string }>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
};

type D1DatabaseBinding = {
  prepare(query: string): D1PreparedStatement;
};

interface Env {
  DB?: D1DatabaseBinding;
}

const VISITOR_COOKIE = "calamansi_visitor_id";

function getVisitorId(request: Request): string {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${VISITOR_COOKIE}=([^;]*)`),
  );
  return match ? match[1] : crypto.randomUUID();
}

/**
 * Handle GET /api/analytics
 * Returns page view and unique visitor stats.
 */
export async function onRequestGet(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const visitorId = getVisitorId(request);

  try {
    let views = 0;
    let visitors = 0;

    if (env?.DB) {
      const result = await env.DB.prepare(`
        SELECT
          COUNT(*) as views,
          COUNT(DISTINCT visitor_id) as visitors
        FROM analytics_page_views
      `).first<{ views: number; visitors: number }>();

      views = Number(result?.views ?? 0);
      visitors = Number(result?.visitors ?? 0);
    }

    const stats = {
      components: 6,
      visitors,
      views,
    };

    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });

    if (!request.headers.get("Cookie")?.includes(VISITOR_COOKIE)) {
      headers.append(
        "Set-Cookie",
        `${VISITOR_COOKIE}=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000; Secure`,
      );
    }

    return new Response(JSON.stringify(stats), { headers });
  } catch {
    return new Response(
      JSON.stringify({ components: 6, visitors: 0, views: 0 }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Handle POST /api/analytics
 * Records a page view into Cloudflare D1.
 */
export async function onRequestPost(context: { env: Env; request: Request }) {
  const { env, request } = context;
  const visitorId = getVisitorId(request);

  try {
    const body = (await request.json().catch(() => ({}))) as {
      path?: string;
    };
    const path = (body.path || "/").slice(0, 300);
    const referrer = request.headers.get("referer") || null;
    const userAgent = request.headers.get("user-agent") || null;

    if (env?.DB) {
      await env.DB.prepare(`
        INSERT INTO analytics_page_views (visitor_id, path, referrer, user_agent)
        VALUES (?1, ?2, ?3, ?4)
      `).bind(visitorId, path, referrer, userAgent).run();
    }

    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });

    if (!request.headers.get("Cookie")?.includes(VISITOR_COOKIE)) {
      headers.append(
        "Set-Cookie",
        `${VISITOR_COOKIE}=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000; Secure`,
      );
    }

    return new Response(JSON.stringify({ ok: true }), { headers });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
