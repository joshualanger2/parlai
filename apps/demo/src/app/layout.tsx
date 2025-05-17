import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Welcome to Parlay Demo</title>
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li>Home</li>
              <li>About Us</li>
              <li>Contact</li>
            </ul>
          </nav>
        </header>
        {children}
        <footer>
          <p>Made with ❤️ by the Parlay Team</p>
          <p>Copyright © 2024 Parlay. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
} 