import { storeHeaders } from "./data-service";

// Knowledge graph — entities and the links between them, found again by your own keywords (node step 654-6).
//
// The node's graph element (LightRAG, one operation per call) never calls a language model: you bring a READY graph — chunks of text,
// the entities they name and the links between them — and you find it again with your own keywords. With this element's own key every
// call works in your own space: `el-<your id>` without `space`, `el-<your id>.<name>` with one. The shared graph and your neighbours'
// spaces are never reached; the node's main agent sees all. One passage found by meaning is simpler in the vector store — see ./vectors.
// ✗ Until 654-6 this file asked a LightRAG server through the data element (`/service/rag/*`) that no node runs: every call 503.

const GRAPH_URL = (process.env.GRAPH_URL ?? "").trim().replace(/\/+$/, "");

export type GraphChunk = { content: string; source_id: string; file_path?: string };
export type GraphEntity = { entity_name: string; entity_type: string; description: string; source_id: string; file_path?: string };
export type GraphRelationship = {
  src_id: string;
  tgt_id: string;
  description: string;
  keywords: string;
  source_id: string;
  weight?: number;
  file_path?: string;
};

async function graphDoor<T>(door: string, body?: unknown): Promise<T> {
  if (!GRAPH_URL) throw new Error("GRAPH_URL is empty — the node installer writes the graph element's address here");
  const res = await fetch(`${GRAPH_URL}/api/${door}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...storeHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Graph ${res.status} on ${door}: ${text.slice(0, 300)}`);
  return JSON.parse(text) as T;
}

/**
 * Store a ready graph. Every entity and link names, by `source_id`, a chunk of the same call; `space` — a space of your own
 * (lower-case latin, digits and dashes, up to 32 characters), none — your home space.
 */
export async function learn(input: {
  space?: string;
  chunks: GraphChunk[];
  entities: GraphEntity[];
  relationships: GraphRelationship[];
}): Promise<{ ok: boolean; chunks: number; entities: number; relationships: number }> {
  return graphDoor("graph-insert", input);
}

/** Find by your own keywords: `ll_keywords` look for entities, `hl_keywords` for links. Nothing close enough → `found: false`. */
export async function ask(input: {
  query: string;
  space?: string;
  mode?: "local" | "global" | "hybrid" | "mix" | "naive";
  ll_keywords?: string[];
  hl_keywords?: string[];
  top_k?: number;
  threshold?: number;
}): Promise<{ ok: boolean; found: boolean; entities: unknown[]; relationships: unknown[]; chunks: unknown[] }> {
  return graphDoor("graph-query", { mode: "mix", ...input });
}

/** Your own spaces and how much each holds (`space: null` — the home space). */
export async function knowledgeStatus(): Promise<{
  ok: boolean;
  installed?: boolean;
  entities: number;
  relationships: number;
  chunks: number;
  spaces?: { space: string | null; entities: number; relationships: number; chunks: number }[];
}> {
  return graphDoor("graph-status");
}
