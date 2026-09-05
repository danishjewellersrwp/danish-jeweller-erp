import './globals.css';

export const metadata = {
  title: 'Danish Jeweller — ERP',
  description: 'Jewellery retail management system for Danish Jeweller',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
