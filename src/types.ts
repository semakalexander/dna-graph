export type DnaMatch = {
  id: number;
  matchID: string;
  name: string;
  age: string;
  country: string;
  contactUrl: string;
  managedByName: string;
  status: string;
  possibleRelationships: string;
  totalCmShared: number;
  percentDnaShared: number;
  sharedSegments: number;
  largestSegmentCm: number;
  hasFamilyTree: boolean;
  individualsInTree: number;
  treeManagedBy: string;
  treeUrl: string;
  sharedAncestralSurnames: string;
  allAncestralSurnames: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShortDnaMatch = Pick<
  DnaMatch,
  "name" | "country" | "percentDnaShared"
> & {
  id?: DnaMatch["id"];
  surnames: string[];
};

export type GroupDna = {
  surname: string;
  matches: ShortDnaMatch[];
};

export enum NodeType {
  surname = 1,
  person = 2,
}

export type Node = d3.SimulationNodeDatum & {
  id: string;
  type: NodeType;
  length?: number;
  color?: string;
};

export type Link = d3.SimulationNodeDatum & {
  source: Node["id"];
  target: Node["id"];
};

export type Data = {
  nodes: Node[];
  links: Link[];
};

export type Cluster = {
  id: string;
  color: string;
  surnames: Node[];
  persons: Node[];
};

export enum P_MARK {
  P_SIMULATION = "P_SIMULATION",
  P_TOGGLE_SURNAMES = "P_TOGGLE_SURNAMES",
  P_DRAW_CHART = "P_DRAW_CHART",
  P_UPDATE_LINKS = "P_UPDATE_LINKS",
  P_UPDATE_NODES = "P_UPDATE_NODES",
  P_UPDATE_LABELS = "P_UPDATE_LABELS",
}
