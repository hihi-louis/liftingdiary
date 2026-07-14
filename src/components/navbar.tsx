"use client";

import { UserButton, useUser } from "@clerk/nextjs";

import { ModeToggle } from "@/components/mode-toggle";

export function Navbar() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <span className="font-heading text-lg font-semibold tracking-tight">
          LiftingDiary
        </span>

        {isSignedIn && (
          <div className="flex items-center gap-3">
            <ModeToggle />
            <UserButton />
          </div>
        )}
      </div>
    </header>
  );
}
