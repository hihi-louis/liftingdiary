"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          LiftingDiary
        </Link>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <ModeToggle />
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
