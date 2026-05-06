import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { LanguageProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Go home</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sattiyar Matrimony — Find Your Perfect Life Partner" },
      { name: "description", content: "Trusted matchmaking for the Sattiyar community in Tamil Nadu. Verified profiles, traditional values, modern experience." },
      { name: "author", content: "Sattiyar Matrimony" },
      { property: "og:title", content: "Sattiyar Matrimony — Find Your Perfect Life Partner" },
      { property: "og:description", content: "Trusted matchmaking for the Sattiyar community in Tamil Nadu. Verified profiles, traditional values, modern experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sattiyar Matrimony — Find Your Perfect Life Partner" },
      { name: "twitter:description", content: "Trusted matchmaking for the Sattiyar community in Tamil Nadu. Verified profiles, traditional values, modern experience." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba6941e4-f664-4566-bd27-257ff8908743/id-preview-d8a5435d--4db0039f-b18f-4a5c-a495-488a6c96cc88.lovable.app-1778078261719.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba6941e4-f664-4566-bd27-257ff8908743/id-preview-d8a5435d--4db0039f-b18f-4a5c-a495-488a6c96cc88.lovable.app-1778078261719.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;800&family=Noto+Serif+Tamil:wght@400;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1"><Outlet /></main>
        <Footer />
        <Toaster richColors position="top-right" />
      </div>
    </LanguageProvider>
  );
}
