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
  ASSETS: {
    fetch: typeof fetch;
  };
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

async function handleAnalytics(request: Request, env: Env): Promise<Response> {
  const visitorId = getVisitorId(request);

  if (request.method === "POST") {
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

  // GET analytics
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
 * GET/POST /api/mascot-pokes
 *
 * Every poke of the mascot is one row. Both verbs answer with the new total, so
 * the header can settle on the server's number instead of its own guess.
 */
async function handleMascotPokes(request: Request, env: Env): Promise<Response> {
  const visitorId = getVisitorId(request);

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

  try {
    if (env?.DB) {
      if (request.method === "POST") {
        await env.DB.prepare(`
          INSERT INTO mascot_pokes (visitor_id)
          VALUES (?1)
        `).bind(visitorId).run();
      }

      const result = await env.DB.prepare(`
        SELECT COUNT(*) as pokes
        FROM mascot_pokes
      `).first<{ pokes: number }>();

      return new Response(
        JSON.stringify({ pokes: Number(result?.pokes ?? 0) }),
        { headers },
      );
    }
  } catch {
    // No database bound yet — answer with the empty count below.
  }

  return new Response(JSON.stringify({ pokes: 0 }), { status: 200, headers });
}

async function handleGithubStars(): Promise<Response> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/fujiDevv/calamansi-ui",
      {
        headers: {
          "User-Agent": "calamansi-ui",
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ stars: null }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    const data = (await response.json()) as { stargazers_count?: number };

    return new Response(
      JSON.stringify({ stars: data.stargazers_count ?? null }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      },
    );
  } catch {
    return new Response(JSON.stringify({ stars: null }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/analytics") {
      return handleAnalytics(request, env);
    }

    if (url.pathname === "/api/mascot-pokes") {
      return handleMascotPokes(request, env);
    }

    if (url.pathname === "/api/github-stars") {
      return handleGithubStars();
    }

    // Serve static assets from Next.js out/ directory
    return env.ASSETS.fetch(request);
  },
};
