import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jet-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MkhSounds | Premium Car Audio South Africa",
    template: "%s | MkhSounds",
  },
  description:
    "MkhSounds — car audio, amplifiers, speakers, and accessories. Dark-room clarity for your drive.",
  metadataBase: new URL("https://mkhsounds.co.za"),
  icons: {
    icon: "/MkH.png",
    apple: "/MkH.png",
    shortcut: "/MkH.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-ZA"
      className={`${dmSans.variable} ${jetMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-100 antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
