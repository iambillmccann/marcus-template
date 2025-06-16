import React from "react";
import { render, screen } from "@testing-library/react";
import SidePanel from "@/components/sidePanel";

// Mock next/link to render a regular anchor tag for testing
jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode; props?: React.AnchorHTMLAttributes<HTMLAnchorElement> }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe("SidePanel", () => {
    it("renders with side panel open", () => {
        const mockMenuItems = [
            { name: "Home", href: "/home" },
            { name: "Settings", href: "/settings" },
            { name: "Background", href: "/background" },
        ];

        render(<SidePanel isSidePanelOpen={true} menuItems={mockMenuItems} />);

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Background")).toBeInTheDocument();
        // Panel should be visible (not translated off screen)
        expect(screen.getByRole("complementary")).toHaveClass("translate-x-0");
    });

    it("renders with side panel closed", () => {
        const mockMenuItems = [
            { name: "Home", href: "/home" },
            { name: "Settings", href: "/settings" },
            { name: "Background", href: "/background" },
        ];

        render(<SidePanel isSidePanelOpen={false} menuItems={mockMenuItems} />);
        // Panel should be hidden (translated off screen)
        expect(screen.getByRole("complementary")).toHaveClass("-translate-x-full");
    });
});