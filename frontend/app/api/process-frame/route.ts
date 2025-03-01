"use server"

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const frame = formData.get('frame') as Blob;

    if (!frame) {
      return NextResponse.json({ error: 'No frame provided' }, { status: 400 });
    }

    // blob to byte buffer
    const buffer = Buffer.from(await frame.arrayBuffer());

    // use PDQ or ssdeep
    // const hash = await computeFuzzyHash(buffer);
    
  } catch (error) {
    return NextResponse.json({ error: 'Frame SERVER error' }, { status: 500 });
  }
}
