import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Civora – Civic Service Locator & Accountability Tool',
  description: 'Locate local public offices, inspect verified statutory fees and requirements, and anonymously report discrepancies.',
  openGraph: {
    title: 'Civora – Civic Service Locator & Accountability Tool',
    description: 'Locate local public offices, inspect verified statutory fees and requirements, and anonymously report discrepancies.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Civora – Civic Service Locator & Accountability Tool',
    description: 'Locate local public offices, inspect verified statutory fees and requirements, and anonymously report discrepancies.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              nextjs-portal,
              [data-nextjs-dev-indicator],
              [data-next-badge],
              div[data-nextjs-toast-errors],
              #next-dev-indicator {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
