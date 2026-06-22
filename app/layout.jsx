import { readFileSync } from "node:fs";
import { join } from "node:path";

const inlineStyles = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

export const metadata = {
  title: "月次面談アジェンダ管理",
  description: "Supabaseを正本とする月次面談アジェンダ管理ツール"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        {children}
      </body>
    </html>
  );
}
