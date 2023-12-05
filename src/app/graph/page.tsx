import React from "react";
import { api } from "~/trpc/server";
import Chart from "~/app/_components/Chart";
import { NodeType } from "~/types";
import PerformanceObserverContainer from "../_components/PerformanceObserverContainer/index";
import { clusterize } from "~/utils";

const Graph = async () => {
  const data = await api.dna.shortData.query();
  const clusters = clusterize(data);

  const dataWithColors = {
    links: data.links,
    nodes: data.nodes.map((node) => {
      const cluster = clusters.find(
        (c) => !!c.surnames.find((s) => s.id === node.id),
      );
      return node.type === NodeType.surname
        ? { ...node, color: cluster?.color ?? "#fff" }
        : node;
    }),
  };

  return (
    <div>
      {process.env.NODE_ENV === "development" && (
        <PerformanceObserverContainer />
      )}
      {data && <Chart data={dataWithColors} clusters={clusters} />}
    </div>
  );
};

export default Graph;
