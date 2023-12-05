"use client";
import classNames from "classnames";
import React from "react";
import useMarksStore from "~/state/useMarksStore";
import { P_MARK } from "~/types";

const PerformanceObserverContainer = () => {
  const activeMarks = useMarksStore((state) => state.activeMarks);
  const toggleMark = useMarksStore((state) => state.toggleMark);

  return (
    <div className="fixed left-leftSidebarWidth top-0 bg-white">
      {Object.values(P_MARK).map((value) => (
        <div
          key={value}
          className={classNames("cursor-pointer", {
            "opacity-40": !activeMarks.includes(value),
          })}
          onClick={() => toggleMark(value)}
        >
          {value}
        </div>
      ))}
    </div>
  );
};

export default PerformanceObserverContainer;
