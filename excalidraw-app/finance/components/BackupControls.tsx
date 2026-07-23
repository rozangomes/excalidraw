import { useRef } from "react";
import { useFinance, STORAGE_VERSION, isValidAppState } from "../store";
import { todayStr } from "../utils";

export function BackupControls() {
  const { state, dispatch, setStorageNotice } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const payload = JSON.stringify(
      { version: STORAGE_VERSION, data: state },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `organizze-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed?.version !== STORAGE_VERSION || !isValidAppState(parsed?.data)) {
          setStorageNotice(
            "Este arquivo de backup não pôde ser importado: formato inválido ou de uma versão incompatível do app.",
          );
          return;
        }
        if (
          !window.confirm(
            "Importar este backup vai substituir todos os dados atuais (contas, cartões, transações e categorias). Continuar?",
          )
        ) {
          return;
        }
        dispatch({ type: "RESTORE_STATE", payload: parsed.data });
        setStorageNotice("Backup importado com sucesso.");
      } catch {
        setStorageNotice(
          "Este arquivo de backup não pôde ser importado: não é um JSON válido.",
        );
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={handleExport}>
        ⬇️ Exportar backup
      </button>
      <button className="fin-btn fin-btn-ghost fin-btn-sm" onClick={handleImportClick}>
        ⬆️ Importar backup
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />
    </div>
  );
}
