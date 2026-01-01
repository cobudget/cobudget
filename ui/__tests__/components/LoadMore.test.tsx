import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mock ReactDOM.createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

// Mock react-intl
vi.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage }: { defaultMessage: string }) =>
    defaultMessage,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

// Mock components that have complex dependencies
vi.mock("components/Spinner", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("components/Icons", () => ({
  CheveronDownIcon: ({ className }: { className: string }) => (
    <span className={className}>icon</span>
  ),
}));

vi.mock("react-in-viewport", () => ({
  useInViewport: () => ({ inViewport: false }),
}));

describe("PortaledLoadMore", () => {
  let portalTarget: HTMLDivElement;

  beforeEach(() => {
    // Create a mock portal target element
    portalTarget = document.createElement("div");
    portalTarget.id = "load-more";
    document.body.appendChild(portalTarget);
  });

  afterEach(() => {
    if (portalTarget && portalTarget.parentNode) {
      portalTarget.parentNode.removeChild(portalTarget);
    }
  });

  it("should render without crashing", async () => {
    // Dynamically import after mocks are set up
    const { PortaledLoadMore } = await import("../../components/LoadMore");

    const { container } = render(
      <PortaledLoadMore>
        <div data-testid="test-content">Test Content</div>
      </PortaledLoadMore>
    );

    // Component should render (either fallback or content)
    expect(container).toBeTruthy();
  }, 15000);

  it("renders children after mount", async () => {
    const { PortaledLoadMore } = await import("../../components/LoadMore");

    render(
      <PortaledLoadMore>
        <span data-testid="portal-content">Portal Content</span>
      </PortaledLoadMore>
    );

    // After mount, should render the children
    await waitFor(() => {
      expect(screen.getByTestId("portal-content")).toBeInTheDocument();
    });
  });
});
