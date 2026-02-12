import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/lib/web3-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGENTS.OS — The Operating System for Commerce",
  description:
    "Autonomous AI Agent Marketplace powered by SKALE Network. Agent-to-Agent negotiation protocol for NFT trading.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
