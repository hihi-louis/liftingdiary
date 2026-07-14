"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useTheme } from "next-themes";

const darkVariables = {
  colorBackground: "oklch(0.205 0 0)",
  colorForeground: "oklch(0.985 0 0)",
  colorMutedForeground: "oklch(0.708 0 0)",
  colorPrimary: "oklch(0.922 0 0)",
  colorPrimaryForeground: "oklch(0.205 0 0)",
  colorInput: "oklch(0.269 0 0)",
  colorInputForeground: "oklch(0.985 0 0)",
  colorNeutral: "oklch(0.985 0 0)",
};

export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        variables: resolvedTheme === "dark" ? darkVariables : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
