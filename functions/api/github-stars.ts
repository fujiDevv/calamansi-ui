/**
 * Edge function to fetch and cache GitHub stars for Calamansi UI
 */
export async function onRequestGet() {
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
