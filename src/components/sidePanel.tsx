"use client";

import Link from "next/link"; // Import Next.js Link component

interface SidePanelProps {
    isSidePanelOpen: boolean;
    menuItems: { name: string; href: string }[];
}

export default function SidePanel({ isSidePanelOpen, menuItems }: SidePanelProps) {
    return (
        <aside
            className={`bg-stone-100 dark:bg-stone-900 p-4 shadow transform transition-transform duration-300 ${isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
                } w-64 flex-shrink-0`}
        >
            <nav>
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.name} className="mb-2">
                            <Link href={item.href} className="hover:underline">
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}