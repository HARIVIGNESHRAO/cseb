import './globals.css';

export const metadata = {
  title: 'CSE-B Study Portal',
  description: 'B.Tech CSE Section B — Study materials for CP, CC, MWT, IoT, CS, IPR',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
