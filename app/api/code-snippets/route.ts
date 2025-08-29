import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filesParam = searchParams.get("files");

  if (!filesParam) {
    return NextResponse.json(
      { error: "Files parameter is required" },
      { status: 400 }
    );
  }

  const fileNames = filesParam.split(",");

  try {
    const fileContents = await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = path.join(process.cwd(), "code-snippets", fileName);
        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          return { [fileName]: fileContent };
        } catch (error) {
          return { [fileName]: "Error loading file" };
        }
      })
    );

    const responseObject = Object.assign({}, ...fileContents);
    return NextResponse.json(responseObject);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 }
    );
  }
}
