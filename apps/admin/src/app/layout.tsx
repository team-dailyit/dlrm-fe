import './globals.css';

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
