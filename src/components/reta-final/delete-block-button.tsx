"use client";

import { Trash2 } from "lucide-react";
import { excluirBloco } from "@/app/reta-final/actions";

export function DeleteBlockButton({ blocoId }: { blocoId: string }) {
  return (
    <form
      action={excluirBloco}
      onSubmit={(event) => {
        if (!window.confirm("Apagar este bloco? O histórico das respostas será mantido.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="blocoId" value={blocoId} />
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-coral-600 hover:text-coral-700"
      >
        <Trash2 size={13} />
        Apagar
      </button>
    </form>
  );
}
