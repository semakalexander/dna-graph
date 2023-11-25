"use client";

import * as d3 from "d3";
import { useCallback, useEffect, useRef, useState, type FC } from "react";
import LeftSidebar from "~/app/_components/LeftSidebar";
import LoadingContainer from "~/app/_components/LoadingContainer";
import RightSidebar from "~/app/_components/RightSidebar";
import type { Cluster, Data, Node } from "~/types";
import { getTargetsRelatedToNodes, isSharedNode, toId } from "~/utils";
import NodeInfo from "./NodeInfo";

const BASE_RADIUS = 2;
const PERSON_NODE_COLOR = "#f4f4f4";
const FORCE_STRENGTH = -1300;

const Chart: FC<{ data: Data; clusters: Cluster[] }> = ({ data, clusters }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [disabledSurnames, setDisabledSurnames] = useState<Node["id"][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const toggleSurnames = useCallback(
    (surnames: Node["id"][]) => {
      if (!data) return;

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
        links: data.links,
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
    },
    [data, disabledSurnames],
  );

  const drawChart = useCallback((data: Data) => {
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
    };

    const updateNodes = () => {
      node
        .attr("id", (d) => toId(d.id))
        .attr("cx", (d) => d.x!)
        .attr("cy", (d) => d.y!)
        .attr("r", (d) => (d.length ? BASE_RADIUS + d.length / 4 : BASE_RADIUS))
        .attr("fill", (d) => d.color ?? PERSON_NODE_COLOR);
    };

    const updateLabels = () => {
      label
        .attr("id", (d) => `text-${toId(d.id)}`)
        .attr("dx", (d) => {
          return isSharedNode(d) ? d.x! + d.length! / 2 : d.x! + 6;
        })
        .attr("dy", (d) => d.y! + 3)
        .attr("fill", "#fff")
        .text((d) => (d.length ? `${d.id} (${d.length})` : d.id));
    };

    const onSimulationEnd = () => {
      updateLinks();
      updateNodes();
      updateLabels();
      setIsSimulating(false);
    };

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
      .scaleExtent([0, 6])
      .on("zoom", ({ transform }) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        node.attr("transform", transform);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        link.attr("transform", transform);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        label.attr("transform", transform);
      });

    svg.call(zoom);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    drawChart(data);
  }, [data, drawChart]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("circle").on("click", (event) => {
      const targetId = (event as { target: { id: Node["id"] } }).target.id;

      setSelectedNode(data.nodes.find((n) => toId(n.id) === targetId) ?? null);
    });
  }, [data.nodes]);

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
    const node = data.nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  return (
    <LoadingContainer isLoading={isSimulating}>
      <LeftSidebar
        data={data}
        clusters={clusters}
        disabledSurnames={disabledSurnames}
        toggleSurnames={toggleSurnames}
        selectNode={(node: Node) => setSelectedNode(node)}
      />

      {selectedNode && (
        <RightSidebar
          data={data}
          clusters={clusters}
          selectedNode={selectedNode}
          selectNode={setSelectedNode}
        />
      )}

      {selectedNode && (
        <NodeInfo selectedNode={selectedNode} selectNodeById={selectNodeById} />
      )}

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
