
export interface Warrior {
  id: string;
  name: string;
  shortDesc: string;
  fullBio: string;
  era: string;
  region: string;
  specialty: string;
  personality: string;
  color: string;
  imageUrl: string;
  quotes: string[];
  achievements: string[];
}

export const warriors: Warrior[] = [
  {
    id: "musashi",
    name: "Miyamoto Musashi",
    shortDesc: "Legendary Japanese swordsman & strategist",
    fullBio: "Miyamoto Musashi (1584-1645) was a Japanese swordsman, philosopher, strategist and writer. He became renowned through stories of his unique double-bladed swordsmanship and undefeated record in duels, numbering over 60. He is the author of 'The Book of Five Rings', a classic text on kenjutsu and martial arts strategy.",
    era: "Early Edo Period",
    region: "Japan",
    specialty: "Dual-sword techniques, strategy",
    personality: "Stoic, philosophical, disciplined, introspective",
    color: "#3b82f6", // blue-500
    imageUrl: "/placeholder.svg",
    quotes: [
      "You must understand that there is more than one path to the top of the mountain.",
      "Today is victory over yourself of yesterday; tomorrow is your victory over lesser men.",
      "Do nothing which is of no use."
    ],
    achievements: [
      "Undefeated in over 60 duels",
      "Created the Niten Ichi-ryū style of swordsmanship",
      "Wrote 'The Book of Five Rings' on martial strategy"
    ]
  },
  {
    id: "joan",
    name: "Joan of Arc",
    shortDesc: "French military leader & Catholic saint",
    fullBio: "Joan of Arc (1412-1431) was a peasant girl who became a national heroine of France. She believed God had chosen her to lead France to victory during the Hundred Years' War. She led the French army to victory at Orléans and witnessed the coronation of King Charles VII. She was later captured, tried for heresy, and burned at the stake.",
    era: "Late Middle Ages",
    region: "France",
    specialty: "Leadership, inspiration, military tactics",
    personality: "Faithful, determined, brave, passionate",
    color: "#e11d48", // rose-600
    imageUrl: "/placeholder.svg",
    quotes: [
      "I am not afraid... I was born to do this.",
      "One life is all we have and we live it as we believe in living it.",
      "Get up tomorrow early in the morning, and earlier than you did today, and do the best that you can."
    ],
    achievements: [
      "Led French forces to victory at the Siege of Orléans",
      "Paved the way for the coronation of Charles VII",
      "Canonized as a Roman Catholic saint in 1920"
    ]
  },
  {
    id: "hannibal",
    name: "Hannibal Barca",
    shortDesc: "Carthaginian general who crossed the Alps",
    fullBio: "Hannibal Barca (247-183 BC) was a Carthaginian general considered one of the greatest military commanders in history. His crossing of the Alps to invade Rome is legendary. He occupied much of Italy for 15 years but was unable to march on Rome. After the war, he became a political leader of Carthage but was forced into exile by political enemies.",
    era: "Second Punic War",
    region: "Carthage (North Africa)",
    specialty: "Military strategy, tactical innovation",
    personality: "Bold, strategic, resourceful, determined",
    color: "#a16207", // amber-700
    imageUrl: "/placeholder.svg",
    quotes: [
      "We will either find a way or make one.",
      "I will either find a way or make one.",
      "The Carthaginians know how to win a victory, but not how to use it."
    ],
    achievements: [
      "Crossed the Alps with war elephants",
      "Defeated Rome at the Battle of Cannae",
      "Maintained an army in Italy for 15 years"
    ]
  },
  {
    id: "leonidas",
    name: "King Leonidas",
    shortDesc: "Spartan king who led the 300 at Thermopylae",
    fullBio: "King Leonidas I (540-480 BC) was a warrior king of the Greek city-state of Sparta. He led the Spartan forces during the Second Persian War and is remembered for his leadership at the Battle of Thermopylae, where he and 300 Spartans fought to the death against a much larger Persian force.",
    era: "Classical Greece",
    region: "Sparta (Greece)",
    specialty: "Leadership, phalanx warfare",
    personality: "Disciplined, laconic, honorable, patriotic",
    color: "#b91c1c", // red-700
    imageUrl: "/placeholder.svg",
    quotes: [
      "Come and take them.",
      "Spartans, prepare for breakfast, and eat hearty, for tonight we dine in Hades.",
      "The wall of men is stronger than the wall of stones."
    ],
    achievements: [
      "Led the defense at the Battle of Thermopylae",
      "Embodied Spartan ideals of courage and sacrifice",
      "Became a symbol of courage against overwhelming odds"
    ]
  },
  {
    id: "alexander",
    name: "Alexander the Great",
    shortDesc: "Macedonian king who built an empire",
    fullBio: "Alexander III of Macedon (356-323 BC), commonly known as Alexander the Great, was a king of the ancient Greek kingdom of Macedon. He created one of the largest empires in ancient history, stretching from Greece to northwestern India. He was undefeated in battle and is considered one of history's greatest military commanders.",
    era: "Hellenistic Period",
    region: "Macedonia (Greece)",
    specialty: "Conquest, military innovation, cultural integration",
    personality: "Ambitious, charismatic, strategic, visionary",
    color: "#7e22ce", // purple-700
    imageUrl: "/placeholder.svg",
    quotes: [
      "There is nothing impossible to him who will try.",
      "I am not afraid of an army of lions led by a sheep; I am afraid of an army of sheep led by a lion.",
      "Remember upon the conduct of each depends the fate of all."
    ],
    achievements: [
      "Created one of the ancient world's largest empires",
      "Remained undefeated in battle",
      "Founded over 20 cities named Alexandria"
    ]
  }
];
