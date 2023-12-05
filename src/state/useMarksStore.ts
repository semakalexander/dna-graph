import { create } from "zustand";
import type { P_MARK } from "~/types";

type MarksStore = {
  activeMarks: P_MARK[];
  toggleMark: (mark: P_MARK) => void;
};

const useMarksStore = create<MarksStore>()((set) => ({
  activeMarks: [],
  toggleMark: (mark) =>
    set((state) => ({
      activeMarks: state.activeMarks.includes(mark)
        ? state.activeMarks.filter((m) => m !== mark)
        : [...state.activeMarks, mark],
    })),
}));

export default useMarksStore;
