import type { ReactNode } from "react";
import { SITE_CONTACT_EMAIL, SITE_NAME, SITE_REPO } from "@/lib/site";

export type Dependency = {
  name: string;
  icon?: ReactNode;
};

export type ComponentProp = {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  options?: string[];
  control?: "swatch";
  optionColors?: Record<string, string>;
  description: string;
};

export type ComponentCategory =
  | "ai"
  | "navigation"
  | "inputs"
  | "feedback"
  | "display"
  | "effects";

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  ai: "AI kit",
  navigation: "Navigation",
  inputs: "Inputs",
  feedback: "Feedback",
  display: "Display",
  effects: "Effects",
};

export const CATEGORY_ORDER: ComponentCategory[] = [
  "display",
  "effects",
  "navigation",
  "inputs",
  "feedback",
  "ai",
];

export type ComponentItem = {
  name: string;
  href: string;
  category: ComponentCategory;
  isNew?: boolean;
  description?: string;
  registry?: string;
  source?: string;
  preview?: string;
  featured?: boolean;
  dependencies?: Dependency[];
  interaction?: string;
  usage?: string;
  props?: ComponentProp[];
  credits?: string[];
};

export const REGISTRY_HOMEPAGE = SITE_REPO;

/** The `owner/repo` slug the shadcn CLI resolves, e.g. `you/calamansi`. */
export const REGISTRY_REPO = SITE_REPO.replace(
  /^https?:\/\/github\.com\//,
  "",
);

export const PANEL_INFO = {
  sourceHint:
    "Click the code icon in the top-right corner to view the source code.",
  keepInMind:
    "Calamansi UI components are copied into your project through the shadcn CLI. Review and adapt them before shipping.",
  contactEmail: SITE_CONTACT_EMAIL,
  issuesUrl: `${REGISTRY_HOMEPAGE}/issues`,
  contactNote: "Found a bug or issue? Open an issue or send a note.",
  license: [
    "Free to use and modify in personal and commercial projects.",
    `Attribution to ${SITE_NAME} is appreciated when using a component.`,
    "Please do not resell the components as your own kit.",
  ],
} as const;

export const components: ComponentItem[] = [
  {
    name: "Calamansi mascot",
    href: "/components/calamansi",
    category: "display",
    isNew: true,
    featured: true,
    registry: "calamansi",
    preview: "/recordings/calamansi-preview.mp4",
    dependencies: [{ name: "gsap" }],
    description:
      "A tiny citrus fruit that blinks, follows your cursor, blushes when you pet it, and goes tart if you poke it too much.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/calamansi.tsx`,
    interaction:
      "It blinks on its own and its eyes track your cursor. Drag the pointer back and forth across it a few times to make it blush. Poke it five times in quick succession and it turns tart for a few seconds. Press and hold to squish it.",
    props: [
      {
        name: "size",
        type: "number",
        default: "160",
        description: "Width and height of the fruit in pixels.",
      },
      {
        name: "variant",
        type: '"default" | "primary"',
        default: '"default"',
        options: ["default", "primary"],
        description:
          'Use "primary" to fill the rind with the theme primary colour, or "default" to inherit the current text colour.',
      },
      {
        name: "mood",
        type: 'CalamansiMood',
        default: '"happy"',
        options: ["happy", "love", "sleepy", "tart"],
        description:
          "The resting expression, applied when the component is not interactive.",
      },
      {
        name: "interactive",
        type: "boolean",
        default: "true",
        description:
          "Enables blinking, cursor tracking, petting and poking. Turn it off for a still, decorative fruit.",
      },
      {
        name: "followCursor",
        type: "boolean",
        default: "interactive",
        description: "Whether the eyes track the pointer around the page.",
      },
      {
        name: "pressable",
        type: "boolean",
        default: "interactive",
        description: "Whether pointer presses squish the fruit.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the SVG root.",
      },
    ],
    usage: `import { Calamansi } from "@/components/ui/calamansi"

export function Demo() {
  return <Calamansi variant="primary" size={200} />
}`,
  },
  {
    name: "Spotlight card",
    href: "/components/spotlight-card",
    category: "effects",
    isNew: true,
    featured: true,
    registry: "spotlight-card",
    preview: "/recordings/spotlight-card-preview.mp4",
    description:
      "A card that lights up under the pointer, with a glowing border that traces the spotlight.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/spotlight-card.tsx`,
    interaction:
      "Move the pointer across the card and the glow follows it. Where the spotlight meets an edge, the border lights up with it.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Content drawn on top of the spotlight.",
      },
      {
        name: "radius",
        type: "number",
        default: "360",
        description: "Radius of the spotlight, in pixels.",
      },
      {
        name: "color",
        type: "string",
        default: "primary",
        description:
          "Any CSS colour for the glow. Defaults to the theme primary at 55% opacity.",
      },
      {
        name: "border",
        type: "boolean",
        default: "true",
        description: "Draw a lit border where the pointer is.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the card.",
      },
    ],
    usage: `import { SpotlightCard } from "@/components/ui/spotlight-card"

export function Demo() {
  return (
    <SpotlightCard className="max-w-sm p-8" radius={420}>
      <h3 className="font-semibold">Zest</h3>
      <p className="text-sm text-muted-foreground">Move your pointer over me.</p>
    </SpotlightCard>
  )
}`,
  },
  {
    name: "Tilt card",
    href: "/components/tilt-card",
    category: "effects",
    isNew: true,
    registry: "tilt-card",
    preview: "/recordings/tilt-card-preview.mp4",
    dependencies: [{ name: "motion" }],
    description:
      "A card that leans towards the pointer in 3D, with a sheen that slides across it.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/tilt-card.tsx`,
    interaction:
      "Move the pointer over the card and it leans towards it, tracking continuously through springs. Let go and it settles back to flat.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Content on the card.",
      },
      {
        name: "maxTilt",
        type: "number",
        default: "12",
        description: "Maximum rotation, in degrees, at the corners.",
      },
      {
        name: "hoverScale",
        type: "number",
        default: "1.02",
        description: "Scale applied while the pointer is over the card.",
      },
      {
        name: "glare",
        type: "boolean",
        default: "true",
        description: "Draw a sheen that follows the pointer.",
      },
      {
        name: "stiffness",
        type: "number",
        default: "220",
        description: "Spring stiffness for the return.",
      },
      {
        name: "damping",
        type: "number",
        default: "18",
        description: "Spring damping. Lower is bouncier.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the card.",
      },
    ],
    usage: `import { TiltCard } from "@/components/ui/tilt-card"

export function Demo() {
  return (
    <TiltCard className="max-w-sm" maxTilt={16}>
      <h3 className="font-semibold">Citrus</h3>
      <p className="text-sm text-muted-foreground">Lean on me.</p>
    </TiltCard>
  )
}`,
  },
  {
    name: "Marquee",
    href: "/components/marquee",
    category: "effects",
    isNew: true,
    registry: "marquee",
    preview: "/recordings/marquee-preview.mp4",
    description:
      "An infinite marquee that loops seamlessly, fades its edges and pauses on hover.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/marquee.tsx`,
    interaction:
      "Hover the marquee to hold the loop in place, then move away and it carries on from where it stopped.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "The row to loop. Rendered twice for a seamless seam.",
      },
      {
        name: "duration",
        type: "number",
        default: "32",
        description: "Seconds for one full loop.",
      },
      {
        name: "reverse",
        type: "boolean",
        default: "false",
        description: "Scroll the other way.",
      },
      {
        name: "pauseOnHover",
        type: "boolean",
        default: "true",
        description: "Hold the loop while the pointer is over it.",
      },
      {
        name: "fade",
        type: "boolean",
        default: "true",
        description: "Fade the leading and trailing edges.",
      },
      {
        name: "gap",
        type: "number",
        default: "32",
        description: "Space between items, in pixels.",
      },
      {
        name: "repeat",
        type: "number",
        default: "2",
        description: "How many copies to render. Two is enough for a full loop.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the wrapper.",
      },
    ],
    usage: `import { Marquee } from "@/components/ui/marquee"

export function Demo() {
  return (
    <Marquee duration={24}>
      {["Blink", "Pet", "Poke", "Blush"].map((word) => (
        <span key={word} className="text-sm font-semibold">
          {word}
        </span>
      ))}
    </Marquee>
  )
}`,
  },
  {
    name: "Number ticker",
    href: "/components/number-ticker",
    category: "effects",
    isNew: true,
    registry: "number-ticker",
    preview: "/recordings/number-ticker-preview.mp4",
    dependencies: [{ name: "motion" }],
    description:
      "An odometer-style number that rolls each digit to the next value.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/number-ticker.tsx`,
    interaction:
      "Change the value and every digit slides to its new position, the columns settling one after another.",
    props: [
      {
        name: "value",
        type: "number",
        required: true,
        description: "The number to show.",
      },
      {
        name: "duration",
        type: "number",
        default: "0.7",
        description: "Seconds for each digit to settle.",
      },
      {
        name: "stagger",
        type: "number",
        default: "0.05",
        description: "Delay between digits, in seconds.",
      },
      {
        name: "direction",
        type: '"up" | "down"',
        default: '"up"',
        options: ["up", "down"],
        description: "Roll the digits upward or downward.",
      },
      {
        name: "prefix",
        type: "string",
        description: "Static text before the digits, such as a currency symbol.",
      },
      {
        name: "suffix",
        type: "string",
        description: "Static text after the digits.",
      },
      {
        name: "format",
        type: "(value: number) => string",
        default: "en-US grouping",
        description: "Turns the number into text before the digits are split.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the ticker.",
      },
    ],
    usage: `import { NumberTicker } from "@/components/ui/number-ticker"

export function Demo() {
  return <NumberTicker value={12847} className="text-4xl font-semibold" />
}`,
  },
  {
    name: "Dock",
    href: "/components/dock",
    category: "navigation",
    isNew: true,
    featured: true,
    registry: "dock",
    preview: "/recordings/dock-preview.mp4",
    dependencies: [{ name: "motion" }],
    description:
      "A dock that magnifies the icon under the pointer, the way a desktop one does.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/dock.tsx`,
    interaction:
      "Glide the pointer along the dock and the nearby icons rise to meet it, springing back as it moves on. Each icon shows its label on hover.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "DockItem elements.",
      },
      {
        name: "reach",
        type: "number",
        default: "130",
        description: "How far from the pointer, in pixels, an item starts growing.",
      },
      {
        name: "size",
        type: "number",
        default: "48",
        description: "Item size at rest, in pixels.",
      },
      {
        name: "magnify",
        type: "number",
        default: "78",
        description: "Item size under the pointer, in pixels.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the dock.",
      },
      {
        name: "label",
        type: "string",
        description: "DockItem only. The label shown above the item on hover.",
      },
      {
        name: "onClick",
        type: "() => void",
        description: "DockItem only. Called when the item is pressed.",
      },
    ],
    usage: `import { Dock, DockItem } from "@/components/ui/dock"
import { House, Search, Heart } from "lucide-react"

export function Demo() {
  return (
    <Dock>
      <DockItem label="Home">
        <House className="size-6" />
      </DockItem>
      <DockItem label="Search">
        <Search className="size-6" />
      </DockItem>
      <DockItem label="Saved">
        <Heart className="size-6" />
      </DockItem>
    </Dock>
  )
}`,
  },
];

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const PM_EXECUTORS: Record<PackageManager, string> = {
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
  bun: "bunx --bun",
};

export const PACKAGE_MANAGERS = Object.keys(PM_EXECUTORS) as PackageManager[];

export function installCommand(
  item: ComponentItem,
  pm: PackageManager = "npm",
): string | null {
  if (!item.registry) return null;
  return `${PM_EXECUTORS[pm]} shadcn@latest add ${REGISTRY_REPO}/${item.registry}`;
}

export type ComponentSection = {
  id: string;
  label: string;
  items: ComponentItem[];
};

export const gallerySections: ComponentSection[] = [
  {
    id: "new",
    label: "New releases",
    items: components.filter((c) => c.isNew).reverse(),
  },
  ...CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    items: components.filter((c) => c.category === id),
  })),
].filter((section) => section.items.length > 0);

export function activeComponent(pathname: string): ComponentItem | undefined {
  return components.find((c) => c.href === pathname);
}

export function swatchProp(item?: ComponentItem): ComponentProp | undefined {
  return item?.props?.find((p) => p.control === "swatch" && p.optionColors);
}

export function cleanDefault(prop?: ComponentProp): string | undefined {
  return prop?.default?.replace(/^["']|["']$/g, "");
}
