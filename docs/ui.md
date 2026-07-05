# UI Coding Standard

## Components: shadcn/ui only

**Only [shadcn/ui](https://ui.shadcn.com) components may be used for UI in this project. Do not create custom components.**

- Do not hand-roll buttons, inputs, cards, dialogs, dropdowns, tables, etc. If shadcn/ui provides it, use it.
- If a needed component doesn't exist yet in `src/components/ui/`, add it via the shadcn CLI:
  ```
  npx shadcn@latest add <component>
  ```
- Do not write bespoke component variants "inspired by" shadcn — compose the generated primitives (`Button`, `Card`, `Dialog`, etc.) instead. Use the `variant`/`size` props and `className` (via `cn()`) to adjust styling; do not fork the component source unless fixing an actual bug in the generated file.
- Page and feature code should only import from `@/components/ui/*` for UI primitives. Layout composition (arranging shadcn components with Tailwind flex/grid classes) is fine and expected — it's the exception, since it's not itself a "custom component."
- No other component libraries (MUI, Chakra, Ant Design, Radix used directly outside of shadcn's wrapper, etc.) may be added.

## Date formatting: date-fns

All dates displayed in the UI must be formatted with [`date-fns`](https://date-fns.org), never hand-written date logic or `Intl.DateTimeFormat`.

Dates must render with an ordinal day suffix in the form `Do MMM yyyy`:

```
1st Sep 2025
2nd Aug 2025
3rd Jul 2024
4th Mar 2026
```

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy");
```

Use this format string consistently everywhere a date is shown in the UI.
