import type { DemoPreset } from "@/lib/types";

export const demoPresets: DemoPreset[] = [
  {
    id: "cellular-respiration",
    subject: "Biology",
    topic: "Cellular Respiration Sprint",
    examDate: "2026-05-11",
    availableHoursPerWeek: 6,
    highlight: "Turns exam-unit notes into a clean revision sprint in one click.",
    focus: "Glycolysis, Krebs cycle, ATP, oxygen, aerobic vs anaerobic pathways.",
    notes: `Cellular respiration is the process cells use to release energy from glucose. It begins with glycolysis in the cytoplasm, where one glucose molecule is split into two pyruvate molecules and a small amount of ATP is made. Pyruvate then enters the mitochondria. During the link reaction and Krebs cycle, carbon dioxide is released and electron carriers such as NADH and FADH2 are produced. These carriers move to the electron transport chain on the inner mitochondrial membrane.

The electron transport chain uses oxygen as the final electron acceptor. This allows oxidative phosphorylation to make most of the ATP in aerobic respiration. Students often confuse where the stages happen: glycolysis is in the cytoplasm, while the Krebs cycle and electron transport chain happen in the mitochondria. Cristae increase the surface area for ATP production.

Aerobic respiration produces much more ATP than anaerobic respiration. In anaerobic conditions, animal cells can carry out lactic acid fermentation, while yeast can carry out alcoholic fermentation. ATP is the immediate energy currency of the cell. Enzymes control each stage, so temperature and pH affect efficiency. Common mistakes include mixing up respiration with photosynthesis, forgetting oxygen's role, or assuming glycolysis needs oxygen directly.`,
  },
  {
    id: "python-oop",
    subject: "Computer Science",
    topic: "Python OOP Fundamentals",
    examDate: "2026-05-09",
    availableHoursPerWeek: 5,
    highlight: "Instantly converts CS notes into flashcards, drills, and a revision plan.",
    focus: "Classes, objects, inheritance, composition, polymorphism, encapsulation.",
    notes: `Object-oriented programming in Python organizes code around classes and objects. A class is a blueprint, while an object is an instance created from that blueprint. Constructors use __init__ to set up state. Methods define behavior. Encapsulation keeps data and methods together and can hide implementation details behind clear interfaces.

Inheritance allows a child class to reuse or extend behavior from a parent class. This reduces duplication, but composition is often preferred when a class should be built from smaller collaborating objects instead of inheriting everything. Polymorphism means different classes can respond to the same method name in different ways, which makes code more flexible.

Common Python OOP exam questions ask students to compare class attributes and instance attributes, explain why self is needed, and trace method overriding. Dunder methods such as __repr__ and __str__ improve readability. Good design avoids giant god classes and favors small focused objects. A strong answer should connect design choices to maintainability, readability, and reuse.`,
  },
  {
    id: "french-revolution",
    subject: "History",
    topic: "French Revolution Revision",
    examDate: "2026-05-15",
    availableHoursPerWeek: 4,
    highlight: "A demo-ready humanities preset with summaries, timelines, and quiz drills.",
    focus: "Three Estates, National Assembly, Terror, Napoleon, social and economic causes.",
    notes: `The French Revolution began in 1789 after years of financial crisis, unequal taxation, food shortages, and resentment toward the privileges of the First and Second Estates. The Third Estate carried most of the tax burden but had the least power. Enlightenment ideas also shaped demands for rights and political reform.

The Estates-General meeting led to the formation of the National Assembly and the Tennis Court Oath. The storming of the Bastille became a symbol of popular resistance. Feudal privileges were challenged, and the Declaration of the Rights of Man and of the Citizen reshaped political expectations.

The revolution became more radical over time. The Reign of Terror under Robespierre used fear and execution to defend the revolution from perceived enemies. Eventually, instability and war opened the path for Napoleon Bonaparte to rise. Students should be able to explain both the causes and the consequences of the revolution, while also comparing moderate and radical phases.`,
  },
];
