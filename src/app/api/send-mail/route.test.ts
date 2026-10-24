// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.hoisted(() => vi.fn());
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail }) } }));

const { POST } = await import("./route");

const SITE_HOST = "batihanozdemir.com";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  subject: "Hello",
  message: "A short message.",
  captchaToken: "token",
};

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/send-mail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

/** Answers the captcha check the way Google's siteverify would. */
const captchaAnswers = (answer: unknown) => {
  const fetchMock = vi.fn(async () => Response.json(answer));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("POST /api/send-mail", () => {
  beforeEach(() => {
    vi.stubEnv("CAPTCHA_SECRET_KEY", "secret");
    sendMail.mockReset();
    sendMail.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects a body that is not JSON", async () => {
    const fetchMock = captchaAnswers({ success: true, hostname: SITE_HOST });
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a field that is not a string", async () => {
    captchaAnswers({ success: true, hostname: SITE_HOST });
    const res = await post({ ...valid, message: { text: "hi" } });
    expect(res.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a bad email", async () => {
    const fetchMock = captchaAnswers({ success: true, hostname: SITE_HOST });
    const res = await post({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a failed captcha", async () => {
    captchaAnswers({ success: false });
    const res = await post(valid);
    expect(res.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a captcha solved on another site", async () => {
    captchaAnswers({ success: true, hostname: "elsewhere.example" });
    const res = await post(valid);
    expect(res.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects when the captcha check cannot be read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>", { status: 502 })),
    );
    const res = await post(valid);
    expect(res.status).toBe(400);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("gives up on a captcha check that does not answer", async () => {
    vi.useFakeTimers();
    // Never answers; rejects only when the route aborts it.
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)),
        ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const answer = post(valid);
    await vi.advanceTimersByTimeAsync(5000);
    const res = await answer;
    expect(res.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("rejects a field over its maximum length", async () => {
    const fetchMock = captchaAnswers({ success: true, hostname: SITE_HOST });
    for (const [field, max] of [
      ["name", 100],
      ["email", 254],
      ["subject", 200],
      ["message", 5000],
      ["captchaToken", 4096],
    ] as const) {
      const over = field === "email" ? `${"a".repeat(max - 11)}@example.com` : "a".repeat(max + 1);
      const res = await post({ ...valid, [field]: over });
      expect(res.status, field).toBe(400);
      const atMax = field === "email" ? `${"a".repeat(max - 12)}@example.com` : "a".repeat(max);
      expect((await post({ ...valid, [field]: atMax })).status, `${field} at max`).toBe(200);
    }
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(sendMail).toHaveBeenCalledTimes(5);
  });

  it("sends a valid message", async () => {
    captchaAnswers({ success: true, hostname: SITE_HOST });
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ replyTo: valid.email, subject: valid.subject }));
  });

  it("answers with a generic body when sending fails", async () => {
    captchaAnswers({ success: true, hostname: SITE_HOST });
    sendMail.mockRejectedValue(new Error("SMTP auth failed for user"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await post(valid);
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ success: false });
    expect(error.mock.calls.flat().map(String).join(" ")).not.toContain("SMTP auth failed");
    error.mockRestore();
  });
});
