import classNames from "classnames";
import { type FC } from "react";
import { type Cluster, type Data, type Node } from "~/types";

const LeftSidebar: FC<{
  data: Data;
  clusters: Cluster[];
  disabledSurnames: Node["id"][];
  disabledClusters: Cluster[];
  toggleSurnames: (surnames: Node["id"][]) => void;
  selectNode: (node: Node) => void;
  toggleClusterFromSimulation: (cluster: Cluster) => void;
}> = ({
  data,
  clusters,
  disabledSurnames,
  disabledClusters,
  toggleSurnames,
  selectNode,
  toggleClusterFromSimulation,
}) => {
  const toggleCluster = (cluster: Cluster) => {
    toggleSurnames(cluster.surnames.map((s) => s.id));
  };

  return (
    <div className="fixed bottom-0 left-0 top-0 flex w-leftSidebarWidth flex-col gap-4 overflow-scroll bg-white px-4 py-4 dark:bg-gray-800 dark:text-gray-200">
      {clusters.map((cluster) => (
        <div key={cluster.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <span
              onClick={() => toggleCluster(cluster)}
              className="cursor-pointer"
            >
              Cluster #{cluster.id}
            </span>

            <span
              className={classNames("cursor-pointer px-2 text-white", {
                "bg-green-800": !disabledClusters.find(
                  (c) => c.id === cluster.id,
                ),
                "bg-red-800": disabledClusters.find((c) => c.id === cluster.id),
              })}
              onClick={() => toggleClusterFromSimulation(cluster)}
            >
              {disabledClusters.find((c) => c.id === cluster.id) ? "Out" : "In"}
            </span>
          </div>

          <div className="flex flex-col">
            {cluster.surnames.map((node, nodeIndex) => {
              const { color, length } =
                data.nodes.find((n) => n.id === node.id) ?? {};

              return (
                <div
                  key={node.id}
                  className={`flex cursor-pointer items-center gap-2 ${
                    disabledSurnames.includes(node.id)
                      ? "opacity-50"
                      : "opacity-100"
                  }`}
                >
                  <span>{`${nodeIndex + 1}.`}</span>
                  <div
                    className={`h-4 w-4 rounded-full`}
                    style={{ backgroundColor: color }}
                    onClick={() => toggleSurnames([node.id])}
                  />
                  <span
                    onClick={() => selectNode(node)}
                  >{`${node.id} (${length})`}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeftSidebar;
