import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 border-t bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 justify-between items-center">
        <p className="text-[15px]">
          &copy; {new Date().getFullYear()} Helpsonic. All rights reserved.
        </p>
        <nav className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="text-sm text-foreground/80 hover:underline hover:underline-offset-4"
          >
            Privacy policy
          </Link>
          <Link
            href="/imprint"
            className="text-sm text-foreground/80 hover:underline hover:underline-offset-4"
          >
            Imprint
          </Link>
        </nav>
      </div>
    </footer>
  );
}
