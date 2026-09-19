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
        name: "texture",
        type: '"textured" | "plain"',
        default: '"textured"',
        options: ["textured", "plain"],
        description:
          'Set to "textured" for a lit rind — pore relief and waxy undulation over the palette colour, with a tight specular core, a bevel and a grounding shadow — or "plain" for a smooth, minimal flat look.',
      },
      {
        name: "variant",
        type: '"default" | "primary" | "citrus" | "slate"',
        default: '"default"',
        options: ["default", "primary", "citrus", "slate"],
        description:
          'Color scheme for the fruit body and foliage. "primary" applies the brand lime, "citrus" applies warm amber, and "slate" applies cool frosted slate.',
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
        description: "Extra classes merged onto the outer element.",
      },
      {
        name: "title",
        type: "ReactNode",
        description:
          "Optional title rendered in a vertical stack above the mascot.",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "Optional description rendered below the title.",
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
      "The plain Calamansi surface as a card, in white or the Calamansi, Slate and Citrus palettes.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/spotlight-card.tsx`,
    interaction:
      "Nothing moves: the card is the branding itself. Pick a palette, pass cornerRadius and cornerSmoothing to reshape the corner, and drop any content inside it.",
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
        description: "Content drawn inside the squircle.",
      },
      {
        name: "cornerRadius",
        type: "number",
        default: "28",
        description: "Corner radius of the squircle, in pixels.",
      },
      {
        name: "cornerSmoothing",
        type: "number",
        default: "1",
        description:
          "Corner smoothing, from 0 (a rounded rectangle) to 1 (a full superellipse).",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette. Calamansi by default; White is white in light mode and near-black in dark, and the tinted palettes carry their own ink.",
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
      subtitle="The branded surface"
    >
      <p className="text-sm text-muted-foreground">
        One flat surface, clipped to the Calamansi squircle.
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
      "A Calamansi card that leans towards your pointer, with a light sheen that follows the tilt.",
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
        description: "Content displayed on the surface.",
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
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette. Calamansi is the default slab; White is white in light mode and near-black in dark.",
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
      "An infinite marquee that loops seamlessly, fades its edges, pauses on hover and takes a palette accent.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/marquee.tsx`,
    interaction:
      "Hover the marquee to hold the loop in place, then move away and it carries on from where it stopped. It stays bare, so the palette is an ink rather than a surface: anything inside that styles from currentColor picks the accent up.",
    props: [
      {
        name: "children",
        type: "ReactNode",
        required: true,
        description: "The row to loop. Rendered twice for a seamless seam.",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Accent palette the row carries. The marquee stays bare, so this is the ink its items tint from rather than a surface; White is the neutral end, the page's own ink.",
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
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette. Calamansi is the default slab; White is white in light mode and near-black in dark.",
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
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette. Calamansi is the default slab; White is white in light mode and near-black in dark.",
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
    name: "Dynamic island",
    href: "/components/dynamic-island",
    category: "navigation",
    isNew: true,
    featured: true,
    registry: "dynamic-island",
    dependencies: [{ name: "motion" }],
    description:
      "A Calamansi island that eases between a compact bar and an expanded slab when tapped, and glows when it alerts.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/dynamic-island.tsx`,
    interaction:
      "Click the island to expand it into rich content. Compact and idle hold the brand corner rather than a stadium — the box is short enough that a flat 28px would be clamped to half its height — and the expanded slab takes the kit's 28px outright. In alert it pulses with an alert glow and a tap badge hint.",
    props: [
      {
        name: "state",
        type: '"idle" | "compact" | "expanded" | "alert"',
        options: ["idle", "compact", "expanded", "alert"],
        description: "Controlled state of the island.",
      },
      {
        name: "defaultState",
        type: '"idle" | "compact" | "expanded" | "alert"',
        default: '"compact"',
        options: ["idle", "compact", "expanded", "alert"],
        description: "Initial state when the island is uncontrolled.",
      },
      {
        name: "onStateChange",
        type: "(state: DynamicIslandState) => void",
        description: "Callback fired when state toggles.",
      },
      {
        name: "icon",
        type: "ReactNode",
        description:
          "Primary icon, drawn in a chip tinted from the surface ink.",
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
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette. Calamansi is the default slab; White is white in light mode and near-black in dark.",
      },
      {
        name: "pulse",
        type: "boolean",
        default: "false",
        description:
          "An ambient pulsing dot beside the title in idle and compact states.",
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
    name: "Gooey nav",
    href: "/components/gooey-nav",
    category: "navigation",
    isNew: true,
    featured: true,
    registry: "gooey-nav",
    dependencies: [
      { name: "motion" },
      { name: "figma-squircle" },
      { name: "react-use-measure" },
    ],
    description:
      "A Calamansi nav whose active item pulls out of the tray on a real liquid thread, and merges back when you pick another.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/gooey-nav.tsx`,
    interaction:
      "Pick an item and the seams either side of it spring open by pulling the surface back, not by moving the layout — the labels never shift and the bar never changes width. In the gap a thread forms by itself: the blur spreads each surface's alpha into the seam, the ramp at half-alpha turns that bleed into solid material, and because the bar has a height the bridge is starved at its midline — it pinches from the full bar down to a few pixels and then severs at 1.234 of the blur radius, which is where the bead swells to full size and dissolves. Raise the viscosity and the thread reaches further and parts later; lower the threshold and the fused edge softens. Sealing runs the same thread backwards — the neck thickens back into the joint, the bead falls back in — and every drop wears the material of its own seam, the palette where the pill is one of the two surfaces meeting there and the tray's own colour where neither is, so a seam between two quiet items closes with a drop of tray rather than a dot of a palette that is nowhere near it. The swallow that hides the seam only arrives once the two surfaces have met, because it is five times longer than the gap you can see and on one spring a re-merge crossed that whole gap in the frames where a spring is moving fastest, which left the neck living a fifth as long shutting as it did opening. Sealed seams are one continuous bar: every surface keeps the brand corner and extends two radii under its neighbour, so the tray reads as a single shape rather than a row of boxes.",
    props: [
      {
        name: "items",
        type: "GooeyNavItem[]",
        description:
          "Labels, or `{ label, href, icon }` objects. An item with an href renders as a link and takes `aria-current`, one without is a button.",
      },
      {
        name: "value",
        type: "number",
        description:
          "Active index, for controlled use. Leave it off and the nav keeps its own, seeded from the route when an item's href matches the current path.",
      },
      {
        name: "defaultValue",
        type: "number",
        default: "0",
        description: "Active index on mount when uncontrolled.",
      },
      {
        name: "onChange",
        type: "(index: number) => void",
        description: "Fired with the new index on selection.",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Palette the active pill is painted in, and with it the drop at each of its own seams. Flat shades of the family's mid stop rather than its gradients, because the liquid has to meet the pill edge to edge.",
      },
      {
        name: "size",
        type: '"xs" | "sm" | "md" | "lg"',
        default: '"md"',
        options: ["xs", "sm", "md", "lg"],
        description:
          "Label size, and with it the corner radius and how far the pill travels.",
      },
      {
        name: "separation",
        type: "number",
        description:
          "Override the gap the pill opens up on each side, in pixels.",
      },
      {
        name: "radius",
        type: "number",
        description:
          "Override the brand corner radius in pixels. Defaults to the kit's share of the bar's height — about two fifths, which is the 28px corner on a 64px pill — so the turn reads the same at every size.",
      },
      {
        name: "viscosity",
        type: "number",
        description:
          "The SVG blur behind the fuse, in pixels, and so how far a thread reaches: the bridge survives to about 1.234 of this before it severs. Defaults to 0.55 of the gap.",
      },
      {
        name: "threshold",
        type: "number",
        default: "19",
        description:
          "The alpha ramp's slope — how hard the fused edge is, and how much the thread thins before it parts.",
      },
      {
        name: "gooey",
        type: "boolean",
        default: "true",
        description:
          "Run the fuse at all. Off, the surfaces simply pull apart. The filter is skipped under reduced motion either way.",
      },
      {
        name: "bead",
        type: "boolean",
        default: "true",
        description:
          "Leave a bead behind when the thread severs — the detail that makes the move read as a liquid rather than a slide. The drop wears the material of its own seam: the palette where the pill is one of the two surfaces meeting there, the tray's own colour where neither is.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the nav.",
      },
    ],
    usage: `import { GooeyNav } from "@/components/ui/gooey-nav"

export function Demo() {
  return (
    <GooeyNav
      items={[
        { label: "Home", href: "/" },
        { label: "Docs", href: "/components/introduction" },
        { label: "Pricing", href: "/pricing" },
      ]}
    />
  )
}`,
  },
  {
    name: "Duration picker",
    href: "/components/duration-picker",
    category: "inputs",
    isNew: true,
    featured: true,
    registry: "duration-picker",
    dependencies: [
      { name: "motion" },
      { name: "figma-squircle" },
      { name: "react-use-measure" },
    ],
    description:
      "A Calamansi duration field: hours, minutes and a save button in one bar that pulls apart on a real liquid thread when you press the pen.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/duration-picker.tsx`,
    interaction:
      'At rest both seams are sealed, so the bar reads as one piece of material: the fields collapse to their digits and the whole thing says "1 Hr. 30 Min.". Press the pen and the seams open by pulling the surfaces apart rather than moving the layout — the fields keep their place, the numbers spring from their collapsed width to a fixed one, and the units lean into the split. The thread between the pieces is real metaball geometry: the stage is blurred, the blur is pushed through a steep alpha ramp so any bleed becomes solid material, and the crisp stage is drawn back over the top. Because the bar has a height the bridge is starved at its midline — it pinches from the full bar down to a few pixels and then severs at 1.234 of the blur radius, which is where the bead swells to full size and dissolves. Committing with the tick, or Enter in either field, merges the pieces back on the same thread in reverse — the surfaces meet, the neck thickens into the joint, and the swallow that seals them waits until they have touched — and fires `onConfirm`; a number past the ceiling is refused with a nudge and taken as the nearest legal value.',
    props: [
      {
        name: "value",
        type: "DurationValue",
        description:
          "Controlled value, `{ hours, minutes }`. A new outside value is adopted unless the field already shows that number, so typing is never fought.",
      },
      {
        name: "defaultValue",
        type: "DurationValue",
        description: "Value on mount when uncontrolled.",
      },
      {
        name: "onChange",
        type: "(value: DurationValue) => void",
        description: "Fired on every keystroke with the clamped value.",
      },
      {
        name: "onConfirm",
        type: "(value: DurationValue) => void",
        description:
          "Fired when the bar is committed — the tick, or Enter in either field.",
      },
      {
        name: "editing",
        type: "boolean",
        description: "Hold the bar open or shut yourself.",
      },
      {
        name: "defaultEditing",
        type: "boolean",
        default: "false",
        description: "Open the bar on mount when uncontrolled.",
      },
      {
        name: "onEditingChange",
        type: "(editing: boolean) => void",
        description: "Fired when the pieces split apart or merge back.",
      },
      {
        name: "maxHours",
        type: "number",
        default: "24",
        description:
          "Ceiling for the hours field, and the verge the input refuses to cross.",
      },
      {
        name: "maxMinutes",
        type: "number",
        default: "60",
        description: "Ceiling for the minutes field.",
      },
      {
        name: "hoursLabel",
        type: "string",
        default: '"Hr."',
        description:
          "Unit after the hours field, and its accessible name as well.",
      },
      {
        name: "minutesLabel",
        type: "string",
        default: '"Min."',
        description: "Unit after the minutes field.",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Palette the save button and its bead are painted in once the seams are open.",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        default: '"md"',
        options: ["sm", "md", "lg"],
        description:
          "Bar height, and with it the corner, the travel and the width a live field grows to.",
      },
      {
        name: "gap",
        type: "number",
        description: "Override how far the seams open on each side, in pixels.",
      },
      {
        name: "radius",
        type: "number",
        description:
          "Override the brand corner radius in pixels. Defaults to the kit's share of the bar — 16 on 40, 20 on 48, 24 on 56.",
      },
      {
        name: "viscosity",
        type: "number",
        description:
          "The SVG blur behind the fuse, in pixels, and so how far a thread reaches: the bridge survives to about 1.234 of this before it severs. Defaults to 0.55 of the gap.",
      },
      {
        name: "threshold",
        type: "number",
        default: "19",
        description:
          "The alpha ramp's slope — how hard the fused edge is, and how much the thread thins before it parts.",
      },
      {
        name: "gooey",
        type: "boolean",
        default: "true",
        description:
          "Run the fuse at all. Off, the pieces simply slide apart. The filter is skipped under reduced motion either way.",
      },
      {
        name: "bead",
        type: "boolean",
        default: "true",
        description:
          "Leave a bead behind when the thread severs. The drop wears the material of its own seam: the palette at the save button's, the tray's own colour between the two fields.",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description:
          "Dim the bar and take both the fields and the tick out of play.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the wrapper.",
      },
    ],
    usage: `import { DurationPicker } from "@/components/ui/duration-picker"

export function Demo() {
  return (
    <DurationPicker
      defaultValue={{ hours: 1, minutes: 30 }}
      onConfirm={(value) => console.log(value)}
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
    dependencies: [
      { name: "motion" },
      { name: "lucide-react" },
      { name: "figma-squircle" },
      { name: "react-use-measure" },
    ],
    description:
      "An iOS-inspired glass widget with a live clock, weather and task cards you can tick off — on its own radius or the Calamansi corner.",
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
        type: '"calamansi" | "slate" | "citrus" | "black"',
        default: '"calamansi"',
        options: ["calamansi", "slate", "citrus", "black"],
        description: "Glass tint background gradient and specular accents.",
      },
      {
        name: "corner",
        type: '"rounded" | "squircle"',
        default: '"rounded"',
        options: ["rounded", "squircle"],
        description:
          'Shell corner. "rounded" is the widget\'s own large radius, the shape it shipped with; "squircle" swaps the surface onto the kit\'s clipped squircle layer, which repaints the lip and the inset highlights along the new curve.',
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
      corner="rounded"
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
    dependencies: [
      { name: "motion" },
      { name: "lucide-react" },
      { name: "figma-squircle" },
      { name: "react-use-measure" },
    ],
    description:
      "A Calamansi card with a drifting sunrise mesh that greets you by name, keeps a live clock and cycles motivational lines.",
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
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette, which recolours the mesh and the ink on it. White is a neutral dawn, Calamansi is the brand greens, Citrus keeps the warm sunrise.",
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
  {
    name: "GitHub activity",
    href: "/components/github-activity",
    category: "display",
    isNew: true,
    featured: true,
    registry: "github-activity",
    dependencies: [{ name: "motion" }],
    description:
      "A Calamansi calendar that plots a year of GitHub contributions, with a drawer of the busiest repositories.",
    credits: [
      "Component adapted from rare-ui (https://github.com/swamimalode07/rare-ui)",
    ],
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/github-activity.tsx`,
    interaction:
      "Hover any day to read its exact count. Press the chevron on the repository drawer to expand it over the calendar, and give the component a username and it fetches the calendar and recent pushes in the browser.",
    props: [
      {
        name: "username",
        type: "string",
        description:
          "GitHub login to read the contribution calendar and recent pushes from. Omit it when passing your own data.",
      },
      {
        name: "contributions",
        type: "Contribution[]",
        description:
          "Pre-fetched calendar of { date, count, level } days. Passing it skips the network entirely.",
      },
      {
        name: "repos",
        type: "RepoContribution[]",
        description:
          "Pre-fetched repository stack of { name, count, logo, href } entries.",
      },
      {
        name: "year",
        type: "number",
        description:
          "Year shown in the heading. Defaults to the year the data ends on.",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Surface palette, which also picks the contribution ramp. Calamansi is the default; White mixes its ramp from the ink, so the cells follow the theme.",
      },
      {
        name: "accent",
        type: "string | string[]",
        description:
          "Contribution ramp for levels 1 to 4. A single colour fades through opacity instead. Defaults to the ramp of the selected variant.",
      },
      {
        name: "cellSize",
        type: "number",
        default: "11",
        description: "Size of one day cell, in pixels.",
      },
      {
        name: "months",
        type: "number",
        default: "12",
        description:
          "How many months of history to show once the card is wide enough for them.",
      },
      {
        name: "showMonths",
        type: "boolean",
        default: "false",
        description: "Show the month labels above the grid.",
      },
      {
        name: "label",
        type: "string",
        default: '"Top contributions in:"',
        description: "Label on the repository drawer.",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        default: "false",
        description: "Open the repository drawer on mount.",
      },
      {
        name: "open",
        type: "boolean",
        description: "Controlled drawer state, paired with onOpenChange.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Called when the drawer opens or closes.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the slab.",
      },
    ],
    usage: `import { GitHubActivity } from "@/components/ui/github-activity"

export function Demo() {
  return (
    <GitHubActivity username="fujiDevv" months={12} showMonths />
  )
}`,
  },
  {
    name: "Matrix orb",
    href: "/components/matrix-orb",
    category: "ai",
    isNew: true,
    featured: true,
    registry: "matrix-orb",
    dependencies: [
      { name: "motion" },
      { name: "figma-squircle" },
      { name: "react-use-measure" },
    ],
    description:
      "A liquid orb that breathes while idle, ripples while listening and churns up droplets while it thinks.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/matrix-orb.tsx`,
    interaction:
      "The body is plain circles and a filter: the stage is blurred, that blur is pushed through a steep alpha ramp so any bleed between the circles becomes solid matter, and the crisp circles are drawn back over the top — so the lobes read as one body whose necks stretch and part. Every state moves the satellites' orbit and radius, which is what merges them into a ball or pulls them off as droplets: idle breathes slowly, listening ripples outward from the core until the lobes detach, and thinking runs each lobe on its own clock so they lap one another. Changing state retargets mid-pulse rather than restarting, blending from what is on screen. Hand it a level from 0 to 1 to drive the amplitude and swell the body from your own audio, turn the fuse off to see the circles underneath, and it holds a still frame when the reader prefers reduced motion.",
    props: [
      {
        name: "state",
        type: '"idle" | "listening" | "thinking"',
        default: '"idle"',
        options: ["idle", "listening", "thinking"],
        description:
          "What the orb is doing. Each state has its own motion, and changing it blends from the state currently on screen.",
      },
      {
        name: "level",
        type: "number",
        description:
          "Amplitude from 0 to 1, for driving the orb from a real signal such as an audio level. Omit it and the orb runs its own envelope.",
      },
      {
        name: "variant",
        type: '"white" | "calamansi" | "slate" | "citrus"',
        default: '"calamansi"',
        options: ["white", "calamansi", "slate", "citrus"],
        description:
          "Accent the dots are painted in — brand lime by default. White is the ink, read from the theme, so the sphere stays monochrome and follows light and dark.",
      },
      {
        name: "color",
        type: "string",
        description:
          "Dot colour, overriding the palette accent. A change recolours the sphere without restarting its motion.",
      },
      {
        name: "size",
        type: "number",
        default: "240",
        description:
          "Width and height of the orb in pixels. The gap under its caption scales with it.",
      },
      {
        name: "lobes",
        type: "number",
        default: "5",
        description:
          "Satellites around the core, 2 to 10. More of them means a busier body and shorter necks between the lobes.",
      },
      {
        name: "gooey",
        type: "boolean",
        default: "true",
        description:
          "Run the fuse at all. Off, the circles simply overlap and you can see the body's construction.",
      },
      {
        name: "viscosity",
        type: "number",
        description:
          "The blur behind the fuse, in pixels — how far a lobe reaches for its neighbour before the neck parts. Defaults to 0.078 of the stage, which at five lobes leaves neighbouring bulges just touching: one silhouette with a dip between them, rather than a pinwheel of separate drops. It scales with the stage, so the body reads the same at every size.",
      },
      {
        name: "threshold",
        type: "number",
        default: "19",
        description:
          "The alpha ramp's slope — how hard the fused edge is, and how much a lobe stretches before it comes off.",
      },
      {
        name: "labels",
        type: "Partial<Record<MatrixOrbState, string>>",
        description:
          'Caption under the orb, per state. Defaults to "Idle", "Listening" and "Thinking".',
      },
      {
        name: "caption",
        type: "boolean",
        default: "true",
        description:
          "Show the caption under the orb. Turn it off when the orb is a small decorative indicator instead of a status the reader is reading.",
      },
      {
        name: "className",
        type: "string",
        description: "Extra classes merged onto the orb's wrapper.",
      },
    ],
    usage: `import { MatrixOrb } from "@/components/ui/matrix-orb"

export function Demo() {
  return <MatrixOrb state="thinking" variant="calamansi" />
}`,
  },
  {
    name: "Sidebar",
    href: "/components/sidebar",
    category: "navigation",
    isNew: true,
    featured: true,
    registry: "sidebar",
    dependencies: [{ name: "motion" }, { name: "lucide-react" }],
    description:
      "A sidebar of sections whose single active marker arcs between rows and crossfades out of one section's ink into the next, as a static rail or as the same panel in a drawer.",
    source: `${REGISTRY_HOMEPAGE}/blob/main/components/ui/sidebar.tsx`,
    interaction:
      "One marker serves the whole list, so picking a row reads as it travelling rather than a second row lighting up, and the path is not a straight line — the marker bows out to the left, and the bow scales with how far it is going, so adjacent hops barely bend and a jump across the nav swings wide. It lands carrying the ink of the section it arrived in, crossfading out of the one it left on the way, which is what makes a jump between sections a different gesture from a step within one. When the arc closes the label is shoved aside, so the label reads as pushed by the marker rather than moving on its own. The drawer is the same panel, not a second implementation of it, so nothing about the list has to be kept in step between the two.",
    props: [
      {
        name: "sections",
        type: "SidebarSection[]",
        description:
          "`{ label, color, items }` — an eyebrow, the section's ink, and its rows. A row is a label, or `{ label, href, icon, badge, disabled }`; one with an href renders as a link, one without as a button.",
      },
      {
        name: "activeHref",
        type: "string",
        description:
          "The row to mark, matched against an item's href — the route-driven case. A route the nav does not contain leaves the marker off rather than parked on the wrong row.",
      },
      {
        name: "value",
        type: "number",
        description: "Active row as a flat index, for controlled use.",
      },
      {
        name: "defaultValue",
        type: "number",
        default: "0",
        description:
          "Active row as a flat index on mount. Ignored once `activeHref` or `value` is given.",
      },
      {
        name: "onChange",
        type: "(index: number, item: SidebarItem) => void",
        description: "Fired with the flat index and the row that was picked.",
      },
      {
        name: "onNavigate",
        type: "(item: SidebarItem) => void",
        description:
          "Fired on every selection, whatever drives the active row. This is where a drawer gets closed.",
      },
      {
        name: "header",
        type: "ReactNode",
        description:
          "Sits above the list and does not scroll — a wordmark, a project switcher.",
      },
      {
        name: "footer",
        type: "ReactNode",
        description:
          "Pinned below the list and does not scroll — an account row, a version.",
      },
      {
        name: "variant",
        type: '"rail" | "drawer"',
        default: '"rail"',
        options: ["rail", "drawer"],
        description:
          "The static panel, or the sliding overlay. Both draw the same list, so they can be mounted side by side.",
      },
      {
        name: "open",
        type: "boolean",
        default: "false",
        description: "Whether the drawer is showing. Drawers only.",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description:
          "Fired when the drawer asks to close — Escape, the scrim, the close button. The page behind it is locked and unlocked for you.",
      },
      {
        name: "navLabel",
        type: "string",
        default: '"Sidebar"',
        description: "The nav's accessible name, and the drawer's dialog name.",
      },
      {
        name: "marker",
        type: '"dot" | "pip" | "bar" | "glow"',
        default: '"dot"',
        options: ["dot", "pip", "bar", "glow"],
        description:
          "Shape of the active marker: a plain dot, the citrus-seed pip, a slim bar, or a dot carrying its own glow.",
      },
      {
        name: "markerColor",
        type: "string",
        default: "var(--primary, #b4e84c)",
        description:
          "Marker colour, and the fallback for any section that does not bring its own.",
      },
      {
        name: "fade",
        type: "boolean",
        default: "true",
        description:
          "Fade a list that overflows at both edges, with the 3rem of padding the stops are matched to — at rest the rows sit inside the opaque zone. The padding comes and goes with the fade, so turning it off leaves no dead space.",
      },
      {
        name: "className",
        type: "string",
        description:
          "The panel's own box — width, position and borders. The rail does not position itself, so sticking it is your call: `sticky top-20 h-[calc(100vh-5rem)] w-60`.",
      },
    ],
    usage: `import { Sidebar } from "@/components/ui/sidebar"

export function Demo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* beside the content, from md up */}
      <Sidebar
        sections={SECTIONS}
        activeHref={pathname}
        marker="pip"
        className="sticky top-20 hidden h-[calc(100vh-5rem)] w-60 md:flex"
      />

      {/* the same panel, over it, on a phone */}
      <Sidebar
        variant="drawer"
        sections={SECTIONS}
        activeHref={pathname}
        open={open}
        onOpenChange={setOpen}
        onNavigate={() => setOpen(false)}
      />
    </>
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
