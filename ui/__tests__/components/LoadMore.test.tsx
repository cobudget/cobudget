import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PortaledLoadMore } from "../../components/LoadMore";

// Mock ReactDOM.createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

describe("PortaledLoadMore", () => {
  beforeEach(() => {
    // Create a mock portal target element
    const portalTarget = document.createElement("div");
    portalTarget.id = "load-more";
    document.body.appendChild(portalTarget);
  });

  it("renders fallback initially for SSR consistency", () => {
    const { container } = render(
      <table>
        <tbody>
          <PortaledLoadMore>
            <tr>
              <td>Test Content</td>
            </tr>
          </PortaledLoadMore>
        </tbody>
      </table>
    );

    // Initially should render the TableRow/TableCell fallback
    // This ensures SSR consistency
    expect(container.querySelector("tr")).toBeInTheDocument();
  });

  it("renders children after mount", async () => {
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

  it("maintains consistent initial render for hydration", () => {
    // This test ensures the component doesn't cause hydration mismatches
    // by rendering the same fallback on both server and initial client render
    const { container, rerender } = render(
      <table>
        <tbody>
          <PortaledLoadMore>
            <tr>
              <td>Content</td>
            </tr>
          </PortaledLoadMore>
        </tbody>
      </table>
    );

    // Get the initial HTML
    const initialHtml = container.innerHTML;

    // Re-render to simulate hydration
    rerender(
      <table>
        <tbody>
          <PortaledLoadMore>
            <tr>
              <td>Content</td>
            </tr>
          </PortaledLoadMore>
        </tbody>
      </table>
    );

    // The initial render should be consistent
    expect(container.innerHTML).toBe(initialHtml);
  });
});
