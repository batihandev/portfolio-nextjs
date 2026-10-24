import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ErrorPage from "./error";

describe("error page", () => {
  it("offers to try again and a way home", async () => {
    const retry = vi.fn();
    render(<ErrorPage error={Object.assign(new Error("boom"), { digest: "123" })} retry={retry} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("This page did not load");
    expect(screen.getByRole("link", { name: "Home page" })).toHaveAttribute("href", "/");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("does not show the error's own message", () => {
    render(<ErrorPage error={new Error("database password rejected")} retry={() => {}} />);
    expect(document.body).not.toHaveTextContent("database password rejected");
  });
});
