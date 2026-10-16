import './globals.css';

import Providers from './providers';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
