import { baseUrl } from "app/sitemap";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const postTitle = searchParams.get("title") || "Untitled Post";
    const postDate = searchParams.get("date")
      ? new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).format(new Date(searchParams.get("date")!))
      : null;
    const font = await fetch(
      new URL("/public/kaisei-tokumin-bold.ttf", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative", // Making the parent container position relative
            backgroundImage: `url(${baseUrl}/og.png)`,
            backgroundSize: "cover",
            padding: "50px",
            color: "white",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {/* Dark overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "150%",
              height: "150%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundSize: "cover",
              overflow: "hidden",
              backgroundColor: "rgba(0, 0, 0, 0.25)", // Dark overlay with 25% opacity
              zIndex: -1,
            }}
          />
          <div
            style={{
              fontSize: 60,
              fontFamily: "Kaisei Tokumin",
              letterSpacing: "0em",
              fontStyle: "normal",
              whiteSpace: "pre-wrap",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {decodeURIComponent(postTitle)}
          </div>
          {postDate && (
            <div
              style={{
                marginTop: "40px",
                fontSize: 20,
                fontFamily: "Kaisei Tokumin",
                color: "#aaa",
                borderTop: "2px solid #aaa",
                paddingTop: "10px",
              }}
            >
              {postDate}
            </div>
          )}
        </div>
      ),
      {
        width: 630,
        height: 630,
        fonts: [
          {
            name: "Kaisei Tokumin",
            data: font,
            style: "normal",
          },
        ],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
