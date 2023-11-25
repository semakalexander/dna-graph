"use client";
import type { FC } from "react";
import { NodeType, type Cluster, type Data, type Node } from "~/types";

const RightSidebar: FC<{
  data: Data;
  clusters: Cluster[];
  selectedNode: Node;
  selectNode: (node: Node | null) => void;
}> = ({ data, clusters, selectedNode, selectNode }) => {
  const node = data.nodes.find((n) => n.id === selectedNode.id);

  if (!node) return null;

  const relatedAsTargetIds = data.links
    .filter((l) => l.source === node.id)
    .map((l) => l.target);

  const relatedAsSourceIds = data.links
    .filter((l) => l.target === node.id)
    .map((l) => l.source);

  const relatedCluster =
    node.type === NodeType.person
      ? clusters.find((c) => c.persons.some((p) => p.id === node.id))
      : clusters.find((c) => c.surnames.some((s) => s.id === node.id));

  const onListItemClick = (id: string) => () => {
    const node = data.nodes.find((n) => n.id === id);
    if (node) selectNode(node);
  };

  const close = () => selectNode(null);

  return (
    <div className="w-rightSidebarWidth fixed right-0 top-0 h-screen overflow-auto bg-white pt-8 dark:bg-gray-800 dark:text-gray-200">
      <div
        className="fixed right-4 top-4 cursor-pointer rounded-full  hover:bg-slate-100"
        onClick={close}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <span className="text-center text-xl" style={{ color: node.color }}>
          {node.id}
        </span>

        {relatedCluster && <span>Related to cluster #{relatedCluster.id}</span>}

        {!!relatedAsTargetIds.length && (
          <div className="flex flex-col gap-2">
            <span>
              There is {relatedAsTargetIds.length} connection from this node to:
            </span>

            <ol className="ml-6 list-decimal">
              {relatedAsTargetIds.map((id) => (
                <li
                  key={id}
                  className="cursor-pointer text-sm hover:underline"
                  onClick={onListItemClick(id)}
                >
                  {id}
                </li>
              ))}
            </ol>
          </div>
        )}

        {!!relatedAsSourceIds.length && (
          <div className="flex flex-col gap-2">
            <span>
              There is {relatedAsSourceIds.length} connection to this node from:
            </span>

            <ol className="ml-6 list-decimal">
              {relatedAsSourceIds.map((id) => (
                <li
                  key={id}
                  className="cursor-pointer text-sm hover:underline"
                  onClick={onListItemClick(id)}
                >
                  {id}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
