import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { NextRouter } from "next/router";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";

import GroupAndRoundHeader from "../../components/Header/GroupAndRoundHeader";

vi.mock("../../components/Header/Selector", () => ({
  default: () => null,
}));

vi.mock("../../components/Icons", () => ({
  SlashIcon: () => null,
}));

const round = {
  slug: "thriving-nodes-supercharge-2024",
  title: "Thriving nodes",
};

function makeRouter(overrides: Partial<NextRouter> = {}): NextRouter {
  return {
    basePath: "",
    pathname: "/[group]/[round]/[bucket]",
    route: "/[group]/[round]/[bucket]",
    query: { group: "enspiral", round: round.slug, bucket: "example-bucket" },
    asPath: `/enspiral/${round.slug}/example-bucket`,
    push: vi.fn().mockResolvedValue(true),
    replace: vi.fn().mockResolvedValue(true),
    reload: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    beforePopState: vi.fn(),
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    isFallback: false,
    isReady: true,
    isPreview: false,
    isLocaleDomain: false,
    ...overrides,
  };
}

function header(router: NextRouter, props = {}) {
  return (
    <RouterContext.Provider value={router}>
      <GroupAndRoundHeader
        currentGroup={null}
        round={round}
        currentUser={{ id: "round-member" }}
        router={router}
        color="blue"
        bucket={{ title: "Example bucket" }}
        {...props}
      />
    </RouterContext.Provider>
  );
}

beforeEach(() => {
  vi.stubEnv("SINGLE_GROUP_MODE", "false");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("GroupAndRoundHeader", () => {
  it.each([null, undefined])(
    "preserves the group route when hidden group metadata is %s",
    (currentGroup) => {
      const router = makeRouter();
      render(header(router, { currentGroup }));

      const link = screen.getByRole("link", { name: round.title });
      expect(link).toHaveAttribute("href", `/enspiral/${round.slug}`);
      expect(screen.getAllByRole("link")).toHaveLength(1);

      fireEvent.click(link);
      expect(router.push).toHaveBeenCalledWith(
        expect.any(String),
        `/enspiral/${round.slug}`,
        expect.any(Object),
      );
    },
  );

  it("keeps standalone rounds under /c", () => {
    const router = makeRouter({ query: { group: "c", round: round.slug } });
    render(header(router));

    expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
      "href",
      `/c/${round.slug}`,
    );
  });

  it.each([undefined, "", ["enspiral"]])(
    "uses the standalone fallback when the group route is %s",
    (group) => {
      const router = makeRouter({ query: { group, round: round.slug } });
      render(header(router));

      expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
        "href",
        `/c/${round.slug}`,
      );
    },
  );

  it("updates the round link when the router becomes ready", () => {
    const { rerender } = render(
      header(makeRouter({ isReady: false, query: {} })),
    );
    expect(screen.queryByText("Example bucket")).not.toBeInTheDocument();

    rerender(header(makeRouter()));

    expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
      "href",
      `/enspiral/${round.slug}`,
    );
    expect(screen.getByText("Example bucket")).toBeInTheDocument();
  });

  it("leaves visible group breadcrumbs unchanged", () => {
    render(
      header(makeRouter(), {
        currentGroup: { slug: "enspiral", name: "Enspiral" },
      }),
    );

    expect(screen.getByRole("link", { name: "Enspiral" })).toHaveAttribute(
      "href",
      "/enspiral",
    );
    expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
      "href",
      `/enspiral/${round.slug}`,
    );
  });

  it("retains the default group route in single-group mode", () => {
    vi.stubEnv("SINGLE_GROUP_MODE", "true");
    render(header(makeRouter()));

    expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
      "href",
      `/c/${round.slug}`,
    );
  });

  it("encodes the group as one route segment", () => {
    const group = "/private/group?query=value#fragment";
    render(header(makeRouter({ query: { group, round: round.slug } })));

    expect(screen.getByRole("link", { name: round.title })).toHaveAttribute(
      "href",
      `/${encodeURIComponent(group)}/${round.slug}`,
    );
  });
});
