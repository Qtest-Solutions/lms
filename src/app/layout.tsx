import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QTest Solutions Academy — Learn. Test. Build Your Career.",
  description: "Practical software testing education built on real QA expertise. Learn manual testing, automation, and quality assurance from industry professionals.",
  icons: {
    icon: "/qtest.png",
  },
  openGraph: {
    title: "QTest Solutions Academy — Learn. Test. Build Your Career.",
    description: "Practical software testing education built on real QA expertise. Learn manual testing, automation, and quality assurance from industry professionals.",
    images: ["/qtest.png"],
    type: "website",
  },
  metadataBase: new URL("https://academy.qtestsolutions.com"),
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("lms-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-background font-sans" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}