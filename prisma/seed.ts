/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { db } from "~/server/db";
import dnaMatches from "~/data/dna";
import type { DnaMatch, ShortDnaMatch } from "~/types";
import { dataToNodesAndLinks } from "~/utils";

const rawToDnaMatch = (
  match: (typeof dnaMatches)[number],
): Omit<DnaMatch, "id" | "createdAt" | "updatedAt"> => ({
  matchID: match["DNA Match ID"],
  name: match.Name,
  age: match.Age,
  country: match.Country,
  contactUrl: match["Contact DNA Manager"],
  managedByName: match["DNA managed by"],
  status: match.Status,
  possibleRelationships: match["Possible relationships"],
  totalCmShared: match["Total cM shared"],
  percentDnaShared: match["Percent DNA shared"],
  sharedSegments: match["Number of shared segments"],
  largestSegmentCm: match["Largest segment (cM)"],
  hasFamilyTree: match["Has family tree"] === "Yes",
  individualsInTree: +match["Number of individuals in the tree"],
  treeManagedBy: match["Tree managed by"],
  treeUrl: match["View tree"],
  sharedAncestralSurnames: match["Shared Ancestral Surnames"],
  allAncestralSurnames: match["All ancestral surnames"],
});

const shortenMatch = (
  match: Omit<DnaMatch, "id" | "createdAt" | "updatedAt">,
): ShortDnaMatch => ({
  name: match.name,
  country: match.country,
  percentDnaShared: match.percentDnaShared,
  surnames: match.allAncestralSurnames.split(","),
});

async function seedDnaMatches() {
  await db.dnaMatch.deleteMany();

  for (const match of dnaMatches) {
    await db.dnaMatch.create({
      data: rawToDnaMatch(match),
    });
  }
}

async function seedLinksAndNodes() {
  await db.link.deleteMany();
  await db.node.deleteMany();

  const shortData = dnaMatches.map((rawMatch) =>
    shortenMatch(rawToDnaMatch(rawMatch)),
  );

  const { links, nodes } = dataToNodesAndLinks(shortData);
  for (const node of nodes) {
    await db.node.create({ data: node });
  }

  for (const link of links) {
    await db.link.create({
      data: { sourceId: link.source, targetId: link.target },
    });
  }
}

seedDnaMatches()
  .then(async () => await seedLinksAndNodes())
  .then(async () => await db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
