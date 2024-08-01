// app/api/code-snippets/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (typeof file !== "string") {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "code-snippets", file);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
