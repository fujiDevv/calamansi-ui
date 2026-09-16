import { readFile } from "node:fs/promises";
import path from "node:path";

type RegistryItemFile = {
  content?: string;
};

type RegistryItemPayload = {
  files?: RegistryItemFile[];
};

// Serves the raw source from generated registry payloads.
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name) return new Response("Missing 'name' query.", { status: 400 });
  if (!/^[a-z0-9-]+$/.test(name)) {
    return new Response("Invalid source name.", { status: 400 });
  }

  try {
    const payloadPath = path.join(process.cwd(), "public", "r", `${name}.json`);
    const payload = JSON.parse(
      await readFile(payloadPath, "utf8"),
    ) as RegistryItemPayload;
    const code = payload.files?.[0]?.content;
    if (!code) return new Response("Source not found.", { status: 404 });

    return new Response(code, {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new Response("Unable to read source.", { status: 500 });
  }
}
