import React, { useState, type FC } from "react";
import { type Node, type DnaMatch, NodeType } from "~/types";
import { api } from "~/trpc/react";
import { splitByPredicate } from "~/utils";
import classNames from "classnames";

const keys: (keyof DnaMatch)[] = [
  "name",
  "age",
  "country",
  "percentDnaShared",
  "individualsInTree",
  "allAncestralSurnames",
  "treeUrl",
];

const NodeInfoItem: FC<{
  match: DnaMatch;
  selectNodeById: (node: Node["id"]) => void;
}> = ({ match, selectNodeById }) => {
  return (
    <tr className="border-b bg-white dark:border-gray-700 dark:bg-gray-800">
      <th
        scope="row"
        className="cursor-pointer whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
        onClick={() => selectNodeById(match.name)}
      >
        {match.name}
      </th>

      {keys
        .filter((k) => k !== "name")
        .map((key) => (
          <td key={key} className="max-w-6xl break-all px-6 py-4">
            {key === "treeUrl" ? (
              <a href={match[key]} target="_blank">
                {match[key]}
              </a>
            ) : (
              match[key].toString()
            )}
          </td>
        ))}
    </tr>
  );
};

const NodeInfo: FC<{
  selectedNode: Node;
  selectNodeById: (nodeId: Node["id"]) => void;
}> = ({ selectedNode, selectNodeById }) => {
  const [isClosed, setIsClosed] = useState(false);
  const isPerson = selectedNode.type === NodeType.person;
  const personResult = api.dna.byName.useQuery<DnaMatch[]>({
    name: selectedNode.id,
  });

  const surnameResult = api.dna.bySurname.useQuery<DnaMatch[]>({
    surname: selectedNode.id,
  });

  const personData = personResult.data ?? [];
  const surnameData = surnameResult.data ?? [];

  const data = isPerson ? personData : surnameData;

  if (!data.length) return null;

  return (
    <div
      className={classNames(
        "fixed bottom-0 left-leftSidebarWidth right-rightSidebarWidth max-h-bottomPanelHeight overflow-y-auto bg-gray-50 pt-6 transition-all duration-300 ease-in-out  dark:bg-gray-800",
        {
          "max-h-9": isClosed,
        },
      )}
    >
      {!isPerson && (
        <div
          className="absolute left-[50%] top-0 cursor-pointer bg-slate-200 px-6 py-2 text-sm tracking-wide text-slate-900 dark:bg-shark dark:text-white"
          onClick={() => setIsClosed(!isClosed)}
        >
          {isClosed ? "Show Details" : "Hide Details"}
        </div>
      )}
      <table className="w-full text-left text-sm text-gray-500 rtl:text-right dark:text-gray-400">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {keys.map((key) => (
              <th key={key} scope="col" className="px-6 py-3">
                {splitByPredicate(key, (c) => c.toUpperCase() === c).join(" ")}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((match) => (
            <NodeInfoItem
              key={match.id}
              match={match}
              selectNodeById={selectNodeById}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NodeInfo;
