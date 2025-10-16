import type { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  await request.arrayBuffer();
  return new Response(null, { status: 200 });
}
