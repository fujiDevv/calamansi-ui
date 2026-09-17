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
export const REGISTRY_REPO = SITE_REPO.replace(/^https?:\/\/github\.com\//, "");

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
        type: "CalamansiMood",
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
    description:
      "A Calamansi surface card designed after the NumberTicker slab, featuring fractal grain noise and a glowing border tracking the pointer along the frosted glass window.",
    credits: [
      "Design inspired by Jay Dwivedi (https://sprrrint.com/jaydwivedi)",
    ],
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/spotlight-card.tsx`,
    interaction:
      "Move the pointer across the card: the border lights up along the frosted glass window where the pointer traces it.",
    props: [
      {
        name: "title",
        type: "ReactNode",
        description: "Title displayed in the header.",
      },
      {
        name: "subtitle",
        type: "ReactNode",
        description: "Subtitle or description shown under the title.",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "Icon displayed alongside the title in the header.",
      },
      {
        name: "badge",
        type: "ReactNode",
        description: "Badge or element displayed at the top right.",
      },
      {
        name: "header",
        type: "ReactNode",
        description: "Custom header element replacing the default title row.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Content drawn inside the frosted glass window.",
      },
      {
        name: "radius",
        type: "number",
        default: "360",
        description: "Radius of the border glow, in pixels.",
      },
      {
        name: "color",
        type: "string",
        default: "rgba(255, 255, 255, 0.75)",
        description:
          "Any CSS colour for the border glow. Defaults to a crisp white light.",
      },
      {
        name: "border",
        type: "boolean",
        default: "true",
        description: "Draw a lit border where the pointer is.",
      },
      {
        name: "variant",
        type: '"calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["calamansi", "slate", "citrus"],
        description:
          "Palette of the Calamansi gradient slab.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the card.",
      },
    ],
    usage: `import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Leaf } from "lucide-react"

export function Demo() {
  return (
    <SpotlightCard
      className="max-w-sm"
      icon={<Leaf className="size-5" />}
      title="Rind"
      subtitle="Glass edge tracking"
      radius={360}
    >
      <p className="text-sm font-medium text-white/85">
        Move your pointer across the card to see the lit border follow the perimeter.
      </p>
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
    dependencies: [{ name: "motion" }],
    description:
      "A Calamansi surface card designed after the NumberTicker slab, featuring 3D spring tilt physics, fractal grain noise, and an interactive light sheen.",
    credits: [
      "Design inspired by Jay Dwivedi (https://sprrrint.com/jaydwivedi)",
    ],
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/tilt-card.tsx`,
    interaction:
      "Move the pointer over the card and it leans towards it, tracking continuously through springs. Let go and it settles back to flat.",
    props: [
      {
        name: "title",
        type: "ReactNode",
        description: "Title displayed in the header.",
      },
      {
        name: "subtitle",
        type: "ReactNode",
        description: "Subtitle or description shown under the title.",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "Icon displayed alongside the title in the header.",
      },
      {
        name: "badge",
        type: "ReactNode",
        description: "Badge or element displayed at the top right.",
      },
      {
        name: "header",
        type: "ReactNode",
        description: "Custom header element replacing the default title row.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Content displayed inside the frosted glass window.",
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
        name: "variant",
        type: '"calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["calamansi", "slate", "citrus"],
        description:
          "Palette of the Calamansi gradient slab.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the card.",
      },
    ],
    usage: `import { TiltCard } from "@/components/ui/tilt-card"
import { Citrus } from "lucide-react"

export function Demo() {
  return (
    <TiltCard
      className="max-w-sm"
      icon={<Citrus className="size-5" />}
      title="Rind"
      subtitle="Interactive 3D"
      maxTilt={16}
    >
      <p className="text-sm font-medium text-white/85">
        Move your pointer over the card to see it lean in 3D.
      </p>
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
        default: "4",
        description:
          "How many copies to render for a seamless continuous loop.",
      },
      {
        name: "vertical",
        type: "boolean",
        default: "false",
        description: "Scroll vertically instead of horizontally.",
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
        description:
          "Static text before the digits, such as a currency symbol.",
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
        description:
          "How far from the pointer, in pixels, an item starts growing.",
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
        name: "panelHeight",
        type: "number",
        description:
          "Fixed height of the dock border box in pixels. Defaults to size + 16.",
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
  {
    name: "Shimmer button",
    href: "/components/shimmer-button",
    category: "inputs",
    isNew: true,
    featured: true,
    registry: "shimmer-button",
    dependencies: [{ name: "motion" }],
    description:
      "A prism-capture CTA button with a rotating border shimmer, a liquid-morph surface canvas that follows the pointer, spring press state and an energy burst on release.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/shimmer-button.tsx`,
    interaction:
      "Hover to intensify the outer glow and liquid blobs. Press to squash the button and release to get a burst of energetic particles.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "Button content.",
      },
      {
        name: "shimmerColor",
        type: "string",
        default: "var(--primary)",
        description: "Color of the rotating border beam.",
      },
      {
        name: "shimmerDuration",
        type: "number",
        default: "3",
        description: "Duration of one full rotation cycle in seconds.",
      },
      {
        name: "shimmerSize",
        type: "number",
        default: "2",
        description: "Border thickness of the shimmer ring in pixels.",
      },
      {
        name: "borderRadius",
        type: "string",
        default: "9999px",
        description: "Border radius of button container.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto button.",
      },
    ],
    usage: `import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Sparkles } from "lucide-react"

export function Demo() {
  return (
    <ShimmerButton>
      <Sparkles className="size-4" />
      <span>Deploy Project</span>
    </ShimmerButton>
  )
}`,
  },
  {
    name: "Dynamic island",
    href: "/components/dynamic-island",
    category: "navigation",
    isNew: true,
    featured: true,
    registry: "dynamic-island",
    dependencies: [{ name: "motion" }],
    description:
      "A Calamansi surface island designed after the NumberTicker slab, featuring fluid spring layout morphing, fine fractal grain noise, and a frosted glass window.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/dynamic-island.tsx`,
    interaction:
      "Click the island to expand it into rich content. In compact and idle states it shows a compact status pill; in alert it pulses with an alert glow and a tap badge hint.",
    props: [
      {
        name: "state",
        type: '"idle" | "compact" | "expanded" | "alert"',
        default: '"compact"',
        options: ["idle", "compact", "expanded", "alert"],
        description: "State controlling dimensions and morphology.",
      },
      {
        name: "onStateChange",
        type: "(state: DynamicIslandState) => void",
        description: "Callback fired when state toggles.",
      },
      {
        name: "leading",
        type: "ReactNode",
        description: "Leading slot in compact/alert state.",
      },
      {
        name: "trailing",
        type: "ReactNode",
        description: "Trailing slot in compact/alert state.",
      },
      {
        name: "title",
        type: "ReactNode",
        description: "Title in compact/alert state.",
      },
      {
        name: "expandedContent",
        type: "ReactNode",
        description: "Full content rendered in expanded mode.",
      },
      {
        name: "interactive",
        type: "boolean",
        default: "true",
        description: "Enable click to expand/collapse.",
      },
      {
        name: "variant",
        type: '"calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["calamansi", "slate", "citrus"],
        description: "Palette of the Calamansi gradient slab.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto island pill.",
      },
    ],
    usage: `import { DynamicIsland } from "@/components/ui/dynamic-island"

export function Demo() {
  return (
    <DynamicIsland
      title="Focus Timer"
      trailing={<span>24:18</span>}
      expandedContent={<div>Expanded Timer View</div>}
    />
  )
}`,
  },
  {
    name: "Task widget",
    href: "/components/task-widget",
    category: "display",
    isNew: true,
    featured: true,
    registry: "task-widget",
    dependencies: [{ name: "motion" }, { name: "lucide-react" }],
    description:
      "An iOS-inspired glassmorphism widget featuring a live digital clock, dynamic weather status, fine grain noise, and tactile task cards with spring checkmarks. Inspired by Jay Dwivedi's design on Sprrrint.",
    credits: [
      "Design inspired by Jay Dwivedi (https://sprrrint.com/jaydwivedi)",
    ],
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/task-widget.tsx`,
    interaction:
      "Click any task card to focus and toggle completion with tactile spring physics. Scroll through tasks to watch the symmetrical bottom progress bar dynamically expand.",
    props: [
      {
        name: "tasks",
        type: "TaskItem[]",
        description:
          "Controlled array of task items with id, title, completed, and icon.",
      },
      {
        name: "defaultTasks",
        type: "TaskItem[]",
        description: "Initial task items when using uncontrolled state.",
      },
      {
        name: "onTaskToggle",
        type: "(taskId: string | number, completed: boolean) => void",
        description: "Callback fired when a task checkbox is pressed.",
      },
      {
        name: "title",
        type: "string",
        default: '"Today"',
        description: "Section header above the task cards.",
      },
      {
        name: "weather",
        type: "{ condition?: string; temperature?: string; icon?: ReactNode }",
        description: "Weather indicator condition and icon.",
      },
      {
        name: "showClock",
        type: "boolean",
        default: "true",
        description: "Toggle visibility of the large live digital clock.",
      },
      {
        name: "timeFormat",
        type: '"12h" | "24h"',
        default: '"12h"',
        options: ["12h", "24h"],
        description: "Display time in 12-hour or 24-hour mode.",
      },
      {
        name: "variant",
        type: '"calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["calamansi", "slate", "citrus"],
        description: "Glass tint background gradient and specular accents.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the widget container.",
      },
    ],
    usage: `import { TaskWidget } from "@/components/ui/task-widget"

export function Demo() {
  return (
    <TaskWidget
      variant="calamansi"
      title="Today's Priorities"
    />
  )
}`,
  },
  {
    name: "Morning widget",
    href: "/components/morning-widget",
    category: "display",
    isNew: true,
    featured: true,
    registry: "morning-widget",
    dependencies: [{ name: "motion" }, { name: "lucide-react" }],
    description:
      "A sunrise-gradient card that greets you by name, keeps a live clock, leans towards the pointer and cycles motivational lines with a staged reveal. Inspired by Jay Dwivedi's design on Sprrrint.",
    credits: [
      "Design inspired by Jay Dwivedi (https://sprrrint.com/jaydwivedi)",
    ],
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/morning-widget.tsx`,
    interaction:
      "Move the pointer over the card and it leans towards it. The line advances on its own every few seconds, or straight away when you click the card. Hovering holds the rotation so you can finish reading, and on a phone the whole widget scales to the width it is given.",
    props: [
      {
        name: "name",
        type: "string",
        default: '"Friend"',
        description: "Name the greeting is addressed to.",
      },
      {
        name: "quotes",
        type: "MotivationQuote[]",
        default: "five starter lines",
        description:
          "Lines the card rotates through. Each one takes a text and an optional list of phrases to emphasise.",
      },
      {
        name: "showClock",
        type: "boolean",
        default: "true",
        description: "Show the live clock above the card.",
      },
      {
        name: "timeFormat",
        type: '"12h" | "24h"',
        default: '"12h"',
        options: ["12h", "24h"],
        description:
          "Render the clock with an AM/PM badge or on the 24-hour clock.",
      },
      {
        name: "interval",
        type: "number",
        default: "9",
        description:
          "Seconds a line stays up before the next one, or 0 to hold the first line.",
      },
      {
        name: "tilt",
        type: "boolean",
        default: "true",
        description: "Lean the card towards the pointer.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the outer container.",
      },
    ],
    usage: `import { MorningWidget } from "@/components/ui/morning-widget"

export function Demo() {
  return (
    <MorningWidget
      name="Josh"
      interval={12}
      quotes={[
        {
          text: "Ship it, then make it better.",
          emphasis: ["Ship it"],
        },
      ]}
    />
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
