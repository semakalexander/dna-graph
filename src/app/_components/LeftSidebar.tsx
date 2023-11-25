import { type FC } from "react";
import { type Cluster, type Data, type Node } from "~/types";

const ListItem: FC<{
  node: Node;
  listNumber: number;
  color?: string;
  length?: number;
  isHidden: boolean;
  toggleSurnames: (nodeId: Node["id"][]) => void;
  selectNode: (node: Node) => void;
}> = ({
  node,
  listNumber,
  color,
  length,
  isHidden,
  toggleSurnames,
  selectNode,
}) => (
  <div
    className={`flex cursor-pointer items-center gap-2 ${
      isHidden ? "opacity-50" : "opacity-100"
    }`}
  >
    <span>{`${listNumber}.`}</span>
    <div
      className={`h-4 w-4 rounded-full`}
      style={{ backgroundColor: color }}
      onClick={() => toggleSurnames([node.id])}
    />
    <span onClick={() => selectNode(node)}>{`${node.id} (${length})`}</span>
  </div>
);

const LeftSidebar: FC<{
  data: Data;
  clusters: Cluster[];
  disabledSurnames: Node["id"][];
  toggleSurnames: (surnames: Node["id"][]) => void;
  selectNode: (node: Node) => void;
}> = ({ data, clusters, disabledSurnames, toggleSurnames, selectNode }) => {
  const toggleCluster = (cluster: Cluster) => {
    toggleSurnames(cluster.surnames.map((s) => s.id));
  };

  return (
    <div className="fixed bottom-0 left-0 top-0 flex w-leftSidebarWidth flex-col gap-4 overflow-scroll bg-white px-4 py-4 dark:bg-gray-800 dark:text-gray-200">
      {clusters.map((cluster) => (
        <div key={cluster.id}>
          <span
            onClick={() => toggleCluster(cluster)}
            className="cursor-pointer"
          >
            Cluster #{cluster.id}
          </span>
          {cluster.surnames.map((node, nodeIndex) => {
            const { color, length } =
              data.nodes.find((n) => n.id === node.id) ?? {};
            return (
              <ListItem
                node={node}
                color={color}
                length={length}
                isHidden={disabledSurnames.includes(node.id)}
                listNumber={nodeIndex + 1}
                toggleSurnames={toggleSurnames}
                key={node.id}
                selectNode={selectNode}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LeftSidebar;
