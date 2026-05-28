export type FruitKind =
  | "raspberry"
  | "orange"
  | "strawberry"
  | "grape"
  | "starfruit";

export type Achievement = {
  id: string;
  label: string;
  fruit: FruitKind;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-pick", label: "First Pick", fruit: "raspberry" },
  { id: "checkout", label: "Checkout", fruit: "orange" },
  { id: "collector", label: "Collector", fruit: "strawberry" },
  { id: "library-pro", label: "Library Pro", fruit: "grape" },
  { id: "mega-pro", label: "Mega Pro", fruit: "starfruit" },
];
