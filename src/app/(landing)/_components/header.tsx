import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { Button } from "~/components/ui/button";

function Header() {
  return (
    <header className="flex justify-between items-center p-4 container">
      <Link href="/">
        {/* <Image src="/logo.png" alt="Helpsonic" width={150} height={40} /> */}
        <h1 className="text-2xl font-bold">Helpsonic</h1>
      </Link>
      <nav className="flex items-center">
        <div className="flex items-center gap-6 mr-10">
          <Link href="/#prompt-enhancer" className="hover:text-blue-500">
            Prompt Enhancer
          </Link>
          <Link href="/pricing" className="hover:text-blue-500">
            Pricing
          </Link>
        </div>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border border-gray-300 rounded-full",
              },
            }}
          />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <Button className="bg-blue-600 text-white px-4 py-2 rounded">
              Sign up
            </Button>
          </SignInButton>
        </SignedOut>
      </nav>
    </header>
  );
}

export default Header;
