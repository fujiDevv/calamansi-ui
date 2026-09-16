import { NextResponse } from "next/server";
import { REGISTRY_REPO } from "@/lib/components";

export async function GET() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REGISTRY_REPO}`,
      {
        headers,
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return NextResponse.json({ stars: null }, { status: response.status });
    }

    const data = await response.json();
    const stars =
      typeof data.stargazers_count === "number"
        ? data.stargazers_count
        : null;

    return NextResponse.json({ stars });
  } catch {
    return NextResponse.json({ stars: null }, { status: 500 });
  }
}
