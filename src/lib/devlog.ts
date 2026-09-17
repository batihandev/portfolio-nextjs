import { site } from "@/data/site";
import type { DevlogEpisode } from "@/types";

const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${site.youtube.channelId}`;
const DAY_IN_SECONDS = 86_400;

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? null;

/** Latest episode from the channel feed, or null when the feed is unavailable. */
export async function getLatestDevlog(): Promise<DevlogEpisode | null> {
  try {
    const res = await fetch(FEED_URL, { next: { revalidate: DAY_IN_SECONDS } });
    if (!res.ok) return null;
    const entry = (await res.text()).match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
    const title = entry && tag(entry, "title");
    const videoId = entry && tag(entry, "yt:videoId");
    if (!title || !videoId) return null;
    return {
      title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      number: Number(title.match(/#(\d+)/)?.[1]) || null,
    };
  } catch {
    return null;
  }
}
