import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import {
  NodeType,
  type Cluster,
  type Data,
  type GroupDna,
  type Link,
  type Node,
  type ShortDnaMatch,
} from "./types";

export const groupBySurname = (matches: Omit<ShortDnaMatch, "id">[]) => {
  const surnames = [
    ...new Set(
      matches.reduce(
        (acc, match) => [...acc, ...match.surnames],
        [] as string[],
      ),
    ),
  ];

  const groups: GroupDna[] = surnames
    .map((surname) => {
      return {
        surname,
        matches: matches.filter((match) => match.surnames.includes(surname)),
      };
    })
    .sort((m1, m2) => m2.matches.length - m1.matches.length);

  return groups;
};

export const removeDuplicates = <T>(data: T[], keys: (keyof T)[]) => {
  return data.reduce((acc, el) => {
    if (acc.find((item) => keys.every((key) => item[key] === el[key])))
      return acc;
    return [...acc, el];
  }, [] as T[]);
};

export const fetcher = (url: string) =>
  fetch(url, { next: { revalidate: 3600 } }).then((res) => res.json());

export const toId = (surname: Node["id"]) =>
  surname
    .replaceAll(" ", "-")
    .replaceAll("(", "lBracket")
    .replaceAll(")", "rBracket")
    .replaceAll("<", "lArrow")
    .replaceAll(">", "rArrow")
    .replaceAll(".", "dot");

export const extended_palette = [
  "#408080",
  "#fe7f2d",
  "#fcca46",
  "#a1c181",
  "#000080",
  "#a53860",
  "#dcc9b6",
  "#5c7457",
  "#8b4c39",
  "#1a5276",
  "#e74c3c",
  "#27ae60",
  "#3498db",
  "#780116",
  "#f39c12",
  "#8e44ad",
  "#d35400",
  "#333d29",
  "#2ecc71",
  "#008000",
  "#008080",
  "#800000",
  "#800080",
  "#808000",
  "#808080",
  "#0000c0",
  "#008040",
  "#0080c0",
  "#800040",
  "#8000c0",
  "#808040",
  "#8080c0",
  "#004000",
  "#004080",
  "#00c000",
  "#00c080",
  "#804000",
  "#804080",
  "#80c000",
  "#80c080",
  "#004040",
  "#0040c0",
  "#00c040",
  "#00c0c0",
  "#804040",
  "#8040c0",
  "#80c040",
  "#80c0c0",
  "#400000",
  "#400080",
  "#408000",
  "#408080",
  "#c00000",
  "#233d4d",
  "#c00080",
  "#c08000",
  "#c08080",
  "#400040",
  "#4000c0",
  "#408040",
  "#4080c0",
  "#c00040",
  "#c000c0",
  "#c08040",
  "#c080c0",
  "#404000",
  "#404080",
];

export const keys = <T extends object>(data: T) =>
  Object.keys(data) as Array<keyof T>;

export const toTuples = <T extends object>(data: T): [keyof T, T[keyof T]][] =>
  keys(data).map((key) => [key, data[key]]);

export const isSharedNode = (node: Node) => node.type === NodeType.surname;

export const getTargetsRelatedToNodes = ({
  links,
  nodeIds,
}: {
  links: Link[];
  nodeIds: Node["id"][];
}) => {
  const relatedLinks = links.filter((link) => nodeIds.includes(link.source));
  const relatedTargets = relatedLinks.map((l) => l.target);
  const groupedTargets = relatedTargets.reduce(
    (acc, target) => ({
      ...acc,
      [target]: links.filter((l) => l.target === target),
    }),
    {} as Record<Link["target"], Link[]>,
  );
  const relatedOnlyToNodes = toTuples(groupedTargets)
    .filter(([, links]) => links.every((l) => nodeIds.includes(l.source)))
    .map(([target]) => target);

  return relatedOnlyToNodes;
};

export const clusterize = (data: Data): Cluster[] => {
  if (!data) return [];
  const { nodes, links } = data;

  const graph = new Graph();
  nodes.forEach((node) => graph.addNode(node.id, { type: node.type }));
  links
    .filter(
      (link) =>
        nodes.some((n) => n.id === link.target) ||
        nodes.some((n) => n.id === link.source),
    )
    .forEach((link) => graph.addEdge(link.source, link.target));

  const communities = louvain(graph);

  const clusters: Record<string, { surnames: Node[]; persons: Node[] }> = {};

  graph.forEachNode((node) => {
    const communityId = communities[node]!;

    if (!clusters[communityId]) {
      clusters[communityId] = {
        surnames: [],
        persons: [],
      };
    }

    const type = graph.getNodeAttribute(node, "type") as NodeType;

    if (type === NodeType.person)
      clusters[communityId]?.persons.push({ id: node, type });
    else clusters[communityId]?.surnames.push({ id: node, type });
  });

  return Object.entries(clusters).map(([id, { surnames, persons }], index) => ({
    id,
    surnames,
    persons,
    color: extended_palette[index] ?? "#fff",
  }));
};

export const validSurname = (surname: string) =>
  surname.length > 3 && surname.toLowerCase() !== "unknown";

export const dataToNodesAndLinks = (data: ShortDnaMatch[]): Data => {
  const grouped = groupBySurname(data)
    .filter((item) => item.matches.length > 20 && validSurname(item.surname))
    .map((g) => ({
      ...g,
      matches: g.matches
        .filter((m) => validSurname(m.name))
        .map((m) => ({
          ...m,
          surnames: m.surnames.filter(validSurname),
        })),
    }));

  const nodes = removeDuplicates(
    [
      ...(grouped.map((g) => ({
        id: g.surname,
        type: NodeType.surname,
        length: g.matches.length,
      })) as Node[]),
      ...grouped.reduce(
        (acc, group) => [
          ...acc,
          ...group.matches.map((m) => ({
            id: m.name,
            type: NodeType.person,
          })),
        ],
        [] as Node[],
      ),
    ],
    ["id"],
  );

  const links = removeDuplicates(
    grouped
      .filter((g) => nodes.some((n) => n.id === g.surname))
      .reduce(
        (acc, group) => [
          ...acc,
          ...group.matches.map((m) => ({
            source: group.surname,
            target: m.name,
          })),
        ],
        [] as Link[],
      ),
    ["target", "source"],
  );

  const nodesWithColors = nodes
    .filter((node) => node.type === NodeType.surname)
    .reduce(
      (acc, node, index) => ({ ...acc, [node.id]: extended_palette[index] }),
      {},
    ) as Record<string, string>;

  return {
    links,
    nodes: nodes.map((node) => ({
      ...node,
      color: nodesWithColors[node.id],
    })),
  };
};

export const splitByPredicate = (
  input: string,
  predicate: (char: string) => boolean,
  excludeDelimeter?: boolean,
): string[] => {
  const result: string[] = [];
  let currentSubstring = "";

  for (const char of input) {
    if (predicate(char)) {
      if (currentSubstring !== "") {
        result.push(currentSubstring);
        currentSubstring = excludeDelimeter ? "" : char;
      }
    } else {
      currentSubstring += char;
    }
  }

  if (currentSubstring !== "") {
    result.push(currentSubstring);
  }

  return result;
};
