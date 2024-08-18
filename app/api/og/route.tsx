import { baseUrl } from "app/sitemap";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title") || "Untitled Post";
  const font = fetch(
    new URL("/public/kaisei-tokumin-bold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundImage: `url(${baseUrl}/og.png)`,
        }}
      >
        <div
          style={{
            marginLeft: 140,
            marginRight: 140,
            display: "flex",
            fontSize: 180,
            fontFamily: "Kaisei Tokumin",
            letterSpacing: "1rem",
            fontStyle: "normal",
            color: "white",
            lineHeight: "180px",
            whiteSpace: "pre-wrap",
          }}
        >
          {decodeURIComponent(postTitle)}
        </div>
      </div>
    ),
    {
      width: 2400,
      height: 1260,
      fonts: [
        {
          name: "Kaisei Tokumin",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
