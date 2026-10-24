import { afterEach, describe, expect, it, vi } from "vitest";
import { getLatestDevlog } from "./devlog";

const feed = (...entries: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns="http://www.w3.org/2005/Atom">
  <title>BatihanDev</title>
  ${entries.join("\n")}
</feed>`;

const entry = (title: string, videoId: string) => `<entry>
    <id>yt:video:${videoId}</id>
    <yt:videoId>${videoId}</yt:videoId>
    <title>${title}</title>
  </entry>`;

const serve = (body: string, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status })),
  );

describe("getLatestDevlog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads the newest entry, not the channel title", async () => {
    serve(feed(entry("Building a game #12: enemies", "abc123"), entry("Older #11", "old111")));
    expect(await getLatestDevlog()).toEqual({
      title: "Building a game #12: enemies",
      url: "https://www.youtube.com/watch?v=abc123",
      thumbnail: "https://i.ytimg.com/vi/abc123/mqdefault.jpg",
      number: 12,
    });
  });

  it("gives no episode number when the title has none", async () => {
    serve(feed(entry("A behind the scenes video", "xyz789")));
    expect((await getLatestDevlog())?.number).toBeNull();
  });

  it("returns null for a feed with no entries", async () => {
    serve(feed());
    expect(await getLatestDevlog()).toBeNull();
  });

  it("returns null when the feed answers with an error", async () => {
    serve("Not found", 404);
    expect(await getLatestDevlog()).toBeNull();
  });

  it("returns null when the feed cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    expect(await getLatestDevlog()).toBeNull();
  });
});
