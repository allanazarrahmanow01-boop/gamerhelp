import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "GamerHelp — Gaming Community Forum",
  description:
    "Get help with any game, find teammates, share tips and strategies. The gaming community that actually helps.",
  keywords: ["gaming forum", "game help", "LFG", "gaming tips", "gaming community"],
  openGraph: {
    title: "GamerHelp",
    description: "The gaming community that actually helps.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="noise">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#16161f",
                color: "#e8e8f0",
                border: "1px solid #1e1e2e",
                fontFamily: "'DM Sans', sans-serif",
              },
              success: { iconTheme: { primary: "#22ff88", secondary: "#0a0a0f" } },
              error: { iconTheme: { primary: "#ff3c3c", secondary: "#0a0a0f" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
