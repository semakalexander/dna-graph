"use client";

import classNames from "classnames";
import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import LeftSidebar from "~/app/_components/LeftSidebar";
import LoadingContainer from "~/app/_components/LoadingContainer";
import RightSidebar from "~/app/_components/RightSidebar";
import { P_MARK, type Cluster, type Data, type Node } from "~/types";
import { getTargetsRelatedToNodes, isSharedNode, toId } from "~/utils";
import NodeInfo from "./NodeInfo";
import usePerformance from "./PerformanceObserverContainer/usePerformance";

const BASE_RADIUS = 2;
const PERSON_NODE_COLOR = "#f4f4f4";
const FORCE_STRENGTH = -1300;

const Chart: FC<{ data: Data; clusters: Cluster[] }> = ({
  data: originalData,
  clusters,
}) => {
  const perf = usePerformance();
  const svgRef = useRef<SVGSVGElement>(null);
  const [disabledSurnames, setDisabledSurnames] = useState<Node["id"][]>([]);
  const [disabledClusters, setDisabledClusters] = useState<Cluster[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulationEnd, setIsSimulationEnd] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showingData, setShowingData] = useState<Data>(originalData);

  const toggleSurnames = useCallback(
    (surnames: Node["id"][]) => {
      perf.start(P_MARK.P_TOGGLE_SURNAMES);
      if (!showingData) return;

      const alreadyDisabled = surnames.filter((s) =>
        disabledSurnames.includes(s),
      );
      const shouldBeDisabled = surnames.filter(
        (s) => !disabledSurnames.includes(s),
      );
      const newDisabledSurnames = [
        ...disabledSurnames,
        ...shouldBeDisabled,
      ].filter((s) => !alreadyDisabled.includes(s));
      const hiddenOpacity = 0.05;

      const svg = d3.select(svgRef.current);

      const relatedTargets = getTargetsRelatedToNodes({
        links: showingData.links,
        nodeIds: newDisabledSurnames,
      });

      const computeOpacity = (node: Node) =>
        newDisabledSurnames.includes(node.id) ||
        relatedTargets.includes(node.id)
          ? hiddenOpacity
          : 1;
      svg
        .selectAll("circle")
        .style("opacity", (node) => computeOpacity(node as Node));

      svg
        .selectAll("text")
        .style("opacity", (node) => computeOpacity(node as Node));

      svg.selectAll("line").style("opacity", (link) => {
        const { source } = link as { source: Node };
        return newDisabledSurnames.includes(source.id) ? hiddenOpacity : 1;
      });

      setDisabledSurnames(newDisabledSurnames);

      perf.end(P_MARK.P_TOGGLE_SURNAMES);
    },
    [showingData, disabledSurnames, perf],
  );

  const drawChart = useCallback(
    (data: Data) => {
      if (isSimulationEnd || isSimulating) return;
      perf.start(P_MARK.P_DRAW_CHART);

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      setIsSimulating(true);

      const links = data.links.map((d) => ({ ...d }));
      const nodes = data.nodes.map((d) => ({ ...d }));

      const link = svg.selectAll("line").data(links).join("line");

      const elem = svg.selectAll("g").data(nodes);
      const elemEnter = elem.enter().append("g");

      const node = elemEnter.append("circle").style("cursor", "pointer");
      const label = elemEnter.append("text").attr("font-size", "8px");

      const updateLinks = () => {
        perf.start(P_MARK.P_UPDATE_LINKS);
        link
          .attr("id", (d) => {
            const source = d.source as unknown as Node;
            const target = d.target as unknown as Node;

            return `link-${toId(source.id)}-${toId(target.id)}`;
          })
          .attr("x1", (d) => {
            const source = d.source as unknown as Node;
            return source.x!;
          })
          .attr("y1", (d) => {
            const source = d.source as unknown as Node;
            return source.y!;
          })
          .attr("x2", (d) => {
            const target = d.target as unknown as Node;
            return target.x!;
          })
          .attr("y2", (d) => {
            const target = d.target as unknown as Node;
            return target.y!;
          })
          .attr("stroke", (d) => {
            const source = d.source as unknown as Node;
            return source.color!;
          });

        perf.end(P_MARK.P_UPDATE_LINKS);
      };

      const updateNodes = () => {
        perf.start(P_MARK.P_UPDATE_NODES);
        node
          .attr("id", (d) => toId(d.id))
          .attr("cx", (d) => d.x!)
          .attr("cy", (d) => d.y!)
          .attr("r", (d) =>
            d.length ? BASE_RADIUS + d.length / 4 : BASE_RADIUS,
          )
          .attr("fill", (d) => d.color ?? PERSON_NODE_COLOR);

        perf.end(P_MARK.P_UPDATE_NODES);
      };

      const updateLabels = () => {
        perf.start(P_MARK.P_UPDATE_LABELS);

        label
          .attr("id", (d) => `text-${toId(d.id)}`)
          .attr("dx", (d) => {
            return isSharedNode(d) ? d.x! + d.length! / 2 : d.x! + 6;
          })
          .attr("dy", (d) => d.y! + 3)
          .attr("fill", "#fff")
          .text((d) => (d.length ? `${d.id} (${d.length})` : d.id));

        perf.end(P_MARK.P_UPDATE_LABELS);
      };

      const onSimulationEnd = () => {
        updateLinks();
        updateNodes();
        updateLabels();
        setIsSimulating(false);
        setIsSimulationEnd(true);
        perf.end(P_MARK.P_SIMULATION);
      };

      perf.start(P_MARK.P_SIMULATION);
      d3.forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d) => (d as Node).id),
        )
        .force("charge", d3.forceManyBody().strength(FORCE_STRENGTH))
        .force(
          "center",
          d3
            .forceCenter(+svg.attr("width") / 2, +svg.attr("height") / 2)
            .strength(0.1),
        )
        .on("end", onSimulationEnd);

      const zoom = d3
        .zoom<SVGSVGElement, null>()
        .scaleExtent([0.1, 6])
        .on("zoom", ({ transform }) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          node.attr("transform", transform);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          link.attr("transform", transform);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          label.attr("transform", transform);
        });

      svg.call(zoom);
      perf.end(P_MARK.P_DRAW_CHART);
    },
    [isSimulating, isSimulationEnd, perf],
  );

  useEffect(() => {
    if (!svgRef.current) return;

    drawChart(showingData);
  }, [showingData, drawChart]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("circle").on("click", (event) => {
      const targetId = (event as { target: { id: Node["id"] } }).target.id;

      setSelectedNode(
        showingData.nodes.find((n) => toId(n.id) === targetId) ?? null,
      );
    });
  }, [showingData.nodes]);

  useEffect(() => {
    const onResize = () => {
      if (!svgRef.current) return;

      svgRef.current.setAttribute("width", window.innerWidth.toString());
      svgRef.current.setAttribute("height", window.innerHeight.toString());
    };

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const selectNodeById = (nodeId: Node["id"]) => {
    const node = showingData.nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  const toggleClusterFromSimulation = (cluster: Cluster) => {
    const clusters = disabledClusters.find((c) => c.id === cluster.id)
      ? disabledClusters.filter((c) => c.id !== cluster.id)
      : [...disabledClusters, cluster];

    const predicate = (id: Node["id"]) =>
      clusters.every(
        (cluster) =>
          !(
            cluster.persons.some((p) => p.id === id) ||
            cluster.surnames.some((s) => s.id === id)
          ),
      );

    const nodesWithoutCluster = originalData.nodes.filter((node) =>
      predicate(node.id),
    );
    const linksWithoutCluster = originalData.links.filter(
      (link) => predicate(link.source) && predicate(link.target),
    );
    const filtered = { nodes: nodesWithoutCluster, links: linksWithoutCluster };

    setDisabledClusters(clusters);
    setShowingData(filtered);
    setIsSimulationEnd(false);
    drawChart(filtered);
  };

  return (
    <LoadingContainer isLoading={isSimulating}>
      <LeftSidebar
        data={originalData}
        clusters={clusters}
        disabledSurnames={disabledSurnames}
        toggleSurnames={toggleSurnames}
        selectNode={(node: Node) => setSelectedNode(node)}
        toggleClusterFromSimulation={toggleClusterFromSimulation}
        disabledClusters={disabledClusters}
      />

      {selectedNode && (
        <RightSidebar
          data={originalData}
          clusters={clusters}
          selectedNode={selectedNode}
          selectNode={setSelectedNode}
        />
      )}

      {selectedNode && (
        <NodeInfo selectedNode={selectedNode} selectNodeById={selectNodeById} />
      )}

      <div
        className={classNames("fixed top-0 cursor-pointer bg-white p-2", {
          "right-rightSidebarWidth": !!selectedNode,
          "right-0": !selectedNode,
        })}
        onClick={() => {
          setIsSimulationEnd(false);
          drawChart(showingData);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      </div>

      <svg
        ref={svgRef}
        id="chart"
        className="h-screen w-screen bg-shark"
        width={1024}
        height={768}
      />
    </LoadingContainer>
  );
};

export default Chart;
