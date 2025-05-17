import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Welcome to Parlai Demo</title>
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
          <p>Made with ❤️ by the Parlai Team</p>
          <p>Copyright © 2024 Parlai. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
} 