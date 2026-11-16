import { Rocket, Code2, Layers, ShieldCheck, Boxes, Zap, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  code: Code2,
  layers: Layers,
  shield: ShieldCheck,
  boxes: Boxes,
  zap: Zap,
};

export function ModuleIcon({ icon, className }: { icon: string; className?: string }) {
  const Cmp = ICONS[icon] ?? Rocket;
  return <Cmp className={className} aria-hidden />;
}
