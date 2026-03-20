import { useCallback, useRef, useState } from "react";

export interface CellPosition {
  row: number;
  col: number;
}

function isValidLine(start: CellPosition, end: CellPosition): boolean {
  const rowDiff = Math.abs(end.row - start.row);
  const colDiff = Math.abs(end.col - start.col);
  return rowDiff === 0 || colDiff === 0 || rowDiff === colDiff;
}

function getCellsInLine(
  start: CellPosition,
  end: CellPosition,
): CellPosition[] {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));

  if (steps === 0) return [{ ...start }];

  const rowStep = rowDiff / steps;
  const colStep = colDiff / steps;

  const cells: CellPosition[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({
      row: start.row + Math.round(i * rowStep),
      col: start.col + Math.round(i * colStep),
    });
  }
  return cells;
}

function getCellFromPoint(x: number, y: number): CellPosition | null {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;

  const cellElement = (element as HTMLElement).closest<HTMLElement>(
    "[data-row]",
  );
  if (!cellElement) return null;

  const row = parseInt(cellElement.dataset.row ?? "", 10);
  const col = parseInt(cellElement.dataset.col ?? "", 10);

  if (isNaN(row) || isNaN(col)) return null;
  return { row, col };
}

interface UseSwipeSelectionOptions {
  onSelectionComplete?: (cells: CellPosition[]) => void;
  onCellSelect?: () => void;
  onCellAdded?: (index: number) => void;
}

export function useSwipeSelection({
  onSelectionComplete,
  onCellSelect,
  onCellAdded,
}: UseSwipeSelectionOptions = {}) {
  const [selectedCells, setSelectedCells] = useState<CellPosition[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const onCompleteRef = useRef(onSelectionComplete);
  onCompleteRef.current = onSelectionComplete;

  const onCellSelectRef = useRef(onCellSelect);
  onCellSelectRef.current = onCellSelect;

  const onCellAddedRef = useRef(onCellAdded);
  onCellAddedRef.current = onCellAdded;

  const selectionRef = useRef<{
    isSelecting: boolean;
    startCell: CellPosition | null;
    currentCells: CellPosition[];
  }>({
    isSelecting: false,
    startCell: null,
    currentCells: [],
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;

      e.preventDefault();
      gridRef.current?.setPointerCapture(e.pointerId);

      selectionRef.current = {
        isSelecting: true,
        startCell: cell,
        currentCells: [cell],
      };
      setSelectedCells([cell]);
      onCellSelectRef.current?.();
      onCellAddedRef.current?.(0);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { isSelecting, startCell, currentCells } = selectionRef.current;
      if (!isSelecting || !startCell) return;

      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;

      if (isValidLine(startCell, cell)) {
        const cells = getCellsInLine(startCell, cell);
        const prevLength = currentCells.length;
        selectionRef.current.currentCells = cells;
        setSelectedCells(cells);

        // Play sound for each new cell added
        if (cells.length > prevLength) {
          for (let i = prevLength; i < cells.length; i++) {
            onCellAddedRef.current?.(i);
          }
        }
      }
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    const { isSelecting, currentCells } = selectionRef.current;
    if (!isSelecting) return;

    const cells = [...currentCells];
    selectionRef.current = {
      isSelecting: false,
      startCell: null,
      currentCells: [],
    };

    if (cells.length > 0) {
      onCompleteRef.current?.(cells);
    }

    setSelectedCells([]);
  }, []);

  return {
    selectedCells,
    gridRef,
    gridProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
  };
}
