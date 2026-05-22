import "dotenv/config";
import { createPrismaClient } from "../src/lib/prisma-factory";

const prisma = createPrismaClient();

const games = [
  {
    id: "raspberry-boi",
    title: "Adventures of Raspberry Boi",
    price: 10,
    concept:
      "Join Raspberry Boi on a heroic quest through candy kingdoms. Slash enemies, collect power-ups, and save the orchard from the sour sorcerer.",
    platforms: ["Windows", "macOS"],
    genre: "Action",
    publisher: "HideAway 57",
    publishedDate: new Date("2025-01-15"),
    coverImage: "/games/raspberry-boi.png",
    coverGradient: "from-pink-600 to-rose-900",
    installerFile: "raspberry-boi.zip",
  },
  {
    id: "cookie-bubble",
    title: "Cookie Cutter Bubble Shooter",
    price: 10,
    concept:
      "Pop bubbles in the sky with your cookie cannon. Match colors, chain combos, and rescue floating friends.",
    platforms: ["Windows", "macOS", "Web"],
    genre: "Puzzle",
    publisher: "HideAway 57",
    publishedDate: new Date("2024-11-20"),
    coverImage: "/games/cookie-bubble.png",
    coverGradient: "from-amber-400 to-orange-800",
    installerFile: "cookie-bubble.zip",
  },
  {
    id: "donut-duelers",
    title: "Donut Duelers",
    price: 10,
    concept:
      "High-noon shootouts in a glazed frontier town. Outdraw rival donuts and become the sheriff of Sprinkle City.",
    platforms: ["Windows", "PlayStation"],
    genre: "Shooter",
    publisher: "HideAway 57",
    publishedDate: new Date("2024-08-01"),
    coverImage: "/games/donut-duelers.png",
    coverGradient: "from-pink-400 to-fuchsia-900",
    installerFile: "donut-duelers.zip",
  },
  {
    id: "froot-shooter",
    title: "Froot Shooter",
    price: 10,
    concept:
      "Angry fruit versus… everyone. Team up as orange, strawberry, and grape in chaotic arena battles.",
    platforms: ["Windows", "Xbox", "Linux"],
    genre: "Arena",
    publisher: "HideAway 57",
    publishedDate: new Date("2025-03-01"),
    coverImage: "/games/froot-shooter.png",
    coverGradient: "from-yellow-500 to-red-800",
    installerFile: "froot-shooter.zip",
  },
  {
    id: "enchanting-broccoli",
    title: "The Enchanting Broccoli",
    price: 10,
    concept:
      "A wizard broccoli casts spells across enchanted gardens. Grow plants, brew potions, and defeat veggie villains.",
    platforms: ["Windows", "macOS", "Nintendo Switch"],
    genre: "RPG",
    publisher: "HideAway 57",
    publishedDate: new Date("2023-12-10"),
    coverImage: "/games/enchanting-broccoli.png",
    coverGradient: "from-green-600 to-purple-900",
    installerFile: "enchanting-broccoli.zip",
  },
  {
    id: "western-roller",
    title: "Western Roller",
    price: 10,
    concept:
      "Roll through the desert as a suitcase outlaw. Dodge cacti, collect gold, and escape the tumbleweed gang.",
    platforms: ["Windows", "macOS"],
    genre: "Adventure",
    publisher: "HideAway 57",
    publishedDate: new Date("2024-05-22"),
    coverImage: "/games/western-roller.png",
    coverGradient: "from-amber-700 to-orange-950",
    installerFile: "western-roller.zip",
  },
];

async function main() {
  for (const game of games) {
    const { platforms, ...rest } = game;
    await prisma.game.upsert({
      where: { id: game.id },
      update: { ...rest, platforms: JSON.stringify(platforms) },
      create: { ...rest, platforms: JSON.stringify(platforms) },
    });
  }
  console.log(`Seeded ${games.length} games.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
