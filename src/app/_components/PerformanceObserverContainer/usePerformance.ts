"use client";
import { useCallback } from "react";
import useMarksStore from "~/state/useMarksStore";
import type { P_MARK } from "~/types";

const usePerformance = () => {
  const activeMarks = useMarksStore((state) => state.activeMarks);

  const start = useCallback(
    (mark: P_MARK) => {
      if (activeMarks.includes(mark)) console.time(mark);
    },
    [activeMarks],
  );

  const end = useCallback(
    (mark: P_MARK) => {
      if (activeMarks.includes(mark)) console.timeEnd(mark);
    },
    [activeMarks],
  );

  return {
    start,
    end,
  };
};

export default usePerformance;
