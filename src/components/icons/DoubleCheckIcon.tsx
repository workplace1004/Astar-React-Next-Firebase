import doubleCheckSvgRaw from "@/assets/doubleCheck.svg?raw";
import { cn } from "@/lib/utils";

type DoubleCheckIconProps = {
  className?: string;
};

/** Renders `src/assets/doubleCheck.svg` so styling stays in sync with the file. */
export function DoubleCheckIcon({ className }: DoubleCheckIconProps) {
  const html = doubleCheckSvgRaw
    .trim()
    .replace(
      /<svg\b/,
      '<svg aria-hidden="true" focusable="false" class="block size-full"',
    );

  return (
    <span
      className={cn("inline-flex shrink-0 [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
