import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Script from "next/script";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        {/* Google Tag Manager */}
        <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-M9DBVJVZMR"
          ></Script>
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'M9DBVJVZMR');
              `,
            }}
          />
        </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <div className="w-full sm:max-w-4xl mx-0 h-screen">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}