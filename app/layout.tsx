import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WaleWorks AI — Beyond CVs. Show What You Can Build.',
  description: 'A living portfolio for student projects, practical skills and real-world work.',
  icons: { icon: '/icon.png', apple: '/apple-icon.png' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
