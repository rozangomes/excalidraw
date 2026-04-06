import { useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

interface Board {
  id: string;
  name: string;
}

const BOARDS_KEY = "my_boards_list";

function getBoardKey(id: string) {
  return `my_board_${id}`;
}

function loadBoards(): Board[] {
  try {
    const raw = localStorage.getItem(BOARDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveBoards(boards: Board[]) {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

function saveBoardData(id: string, excalidrawAPI: ExcalidrawImperativeAPI) {
  const data = {
    elements: excalidrawAPI.getSceneElements(),
    appState: excalidrawAPI.getAppState(),
  };
  localStorage.setItem(getBoardKey(id), JSON.stringify(data));
}

function loadBoardData(id: string) {
  try {
    const raw = localStorage.getItem(getBoardKey(id));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

interface Props {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export const BoardsSidebar = ({ excalidrawAPI }: Props) => {
  const [boards, setBoards] = useState<Board[]>(() => {
    const saved = loadBoards();
    if (saved.length === 0) {
      const first: Board = { id: Date.now().toString(), name: "Lousa 1" };
      saveBoards([first]);
      return [first];
    }
    return saved;
  });

  const [currentId, setCurrentId] = useState<string>(() => {
    return loadBoards()[0]?.id ?? "";
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const switchBoard = (id: string) => {
    if (!excalidrawAPI || id === currentId) return;

    saveBoardData(currentId, excalidrawAPI);

    const data = loadBoardData(id);
    excalidrawAPI.updateScene({
      elements: data?.elements ?? [],
      appState: { collaborators: new Map() },
    });

    setCurrentId(id);
  };

  const createBoard = () => {
    if (excalidrawAPI) {
      saveBoardData(currentId, excalidrawAPI);
    }

    const newBoard: Board = {
      id: Date.now().toString(),
      name: `Lousa ${boards.length + 1}`,
    };

    const updated = [...boards, newBoard];
    saveBoards(updated);
    setBoards(updated);

    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: [],
        appState: { collaborators: new Map() },
      });
    }

    setCurrentId(newBoard.id);
  };

  const startRename = (board: Board) => {
    setEditingId(board.id);
    setEditingName(board.name);
  };

  const confirmRename = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    const updated = boards.map((b) => (b.id === id ? { ...b, name: trimmed } : b));
    saveBoards(updated);
    setBoards(updated);
    setEditingId(null);
  };

  const exportBoard = (board: Board) => {
    if (board.id === currentId && excalidrawAPI) {
      saveBoardData(currentId, excalidrawAPI);
    }

    const data = loadBoardData(board.id);
    const fileContent = JSON.stringify(
      {
        type: "excalidraw",
        version: 2,
        source: window.location.origin,
        elements: data?.elements ?? [],
        appState: {
          gridSize: null,
          viewBackgroundColor: "#ffffff",
          ...(data?.appState ?? {}),
        },
        files: {},
      },
      null,
      2,
    );

    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${board.name}.excalidraw`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteBoard = (id: string) => {
    if (boards.length === 1) return;

    const updated = boards.filter((b) => b.id !== id);
    saveBoards(updated);
    setBoards(updated);
    localStorage.removeItem(getBoardKey(id));

    if (id === currentId) {
      const next = updated[0];
      const data = loadBoardData(next.id);
      excalidrawAPI?.updateScene({
        elements: data?.elements ?? [],
        appState: { collaborators: new Map() },
      });
      setCurrentId(next.id);
    }
  };

  return (
    <div
      style={{
        width: 200,
        minWidth: 200,
        height: "100%",
        background: "#f8f9fa",
        borderRight: "1px solid #dee2e6",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        fontSize: 14,
        zIndex: 10,
      }}
    >
      <div
        style={{
          padding: "12px 12px 8px",
          fontWeight: 600,
          fontSize: 13,
          color: "#495057",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Minhas Lousas</span>
        <button
          onClick={createBoard}
          title="Nova lousa"
          style={{
            background: "#5c7cfa",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            width: 26,
            height: 26,
            cursor: "pointer",
            fontSize: 18,
            lineHeight: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          +
        </button>
      </div>

      <div style={{ overflowY: "auto", flex: 1, padding: "6px 0" }}>
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => switchBoard(board.id)}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              background: board.id === currentId ? "#e7f5ff" : "transparent",
              borderLeft:
                board.id === currentId ? "3px solid #339af0" : "3px solid transparent",
              display: "flex",
              alignItems: "center",
              gap: 6,
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: 16 }}>🖊️</span>

            {editingId === board.id ? (
              <input
                ref={inputRef}
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => confirmRename(board.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmRename(board.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  flex: 1,
                  border: "1px solid #339af0",
                  borderRadius: 4,
                  padding: "2px 4px",
                  fontSize: 13,
                }}
              />
            ) : (
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13,
                  color: "#212529",
                }}
              >
                {board.name}
              </span>
            )}

            <button
              title="Exportar"
              onClick={(e) => {
                e.stopPropagation();
                exportBoard(board);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                opacity: 0.5,
                fontSize: 12,
              }}
            >
              💾
            </button>

            <button
              title="Renomear"
              onClick={(e) => {
                e.stopPropagation();
                startRename(board);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 2,
                opacity: 0.5,
                fontSize: 12,
              }}
            >
              ✏️
            </button>

            {boards.length > 1 && (
              <button
                title="Excluir"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBoard(board.id);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
