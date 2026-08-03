// Tailwind can't detect dynamically-built class names (e.g. `text-brand-${x}`) at build
// time, so any color tag stored in the database is mapped through this static lookup.
const TEXT_MAP: Record<string, string> = {
  green: "text-brand-green2",
  blue: "text-brand-blue",
  purple: "text-brand-purple",
  gold: "text-brand-gold",
  red: "text-brand-red",
  pink: "text-brand-pink",
  teal: "text-brand-teal",
  orange: "text-brand-orange",
};

const BG_MAP: Record<string, string> = {
  green: "bg-brand-green/15",
  blue: "bg-brand-blue/15",
  purple: "bg-brand-purple/15",
  gold: "bg-brand-gold/15",
  red: "bg-brand-red/15",
  pink: "bg-brand-pink/15",
  teal: "bg-brand-teal/15",
  orange: "bg-brand-orange/15",
};

export const COLOR_TAGS = Object.keys(TEXT_MAP);

export function colorTagClass(tag: string): string {
  return TEXT_MAP[tag] || TEXT_MAP.green;
}

export function colorTagBgClass(tag: string): string {
  return BG_MAP[tag] || BG_MAP.green;
}
