import { NextResponse } from "next/server";
import { Room, RoomServiceClient } from "livekit-server-sdk";

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

    // if hash similarity below threshold, send send image as base64 using bytestreaming
    const roomService = new RoomServiceClient(process.env.LIVEKIT_URL!, process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);

    const options = {
      name: 'frame-room',
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
    };
    const room: Room = await roomService.createRoom(options).then((room: Room) => {
      console.log('created room: ', room);
      return room;
    })

    const writer = await room.localParticipant.streamBytes({
      name: 'frame-byte-stream',
      topic: 'frame-data'
    });
    console.log(`Opened byte stream with ID: ${writer.info.id}`);
    const chunkSize = 15000 // 15 kB
    await writer.write(buffer, chunkSize);
    await writer.close();
    console.log(`Wrote ${buffer.length} bytes to byte stream`);
    
    return NextResponse.json({ message: 'Frame processed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Frame SERVER error' }, { status: 500 });
  }
}