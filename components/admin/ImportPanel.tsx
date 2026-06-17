"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type ImportResult = {
  success: boolean;
  data?: {
    batch: { id: string; status: string; totalRows: number; errorCount: number; originalFileName: string };
    preview: {
      prepared: Array<{ row: number; number: number; categoryName: string; difficulty: string; conditionMarkdown: string; images: Array<{ fileName: string }> }>;
      errors: Array<{ row?: number; field?: string; message: string; fragment?: string; existingNumber?: number }>;
      warnings: Array<{ row?: number; field?: string; message: string }>;
    };
  };
  error?: { message: string };
};

export function ImportPanel() {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function upload(formData: FormData) {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/import/upload", { method: "POST", body: formData });
    setResult(await response.json() as ImportResult);
    setLoading(false);
  }

  async function commit() {
    if (!result?.data?.batch.id) return;
    setLoading(true);
    const response = await fetch("/api/admin/import/commit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ batchId: result.data.batch.id })
    });
    const json = await response.json() as { success: boolean; error?: { message: string }; data?: { createdIds: string[] } };
    setLoading(false);
    setMessage(json.success ? `Импортировано заданий: ${json.data?.createdIds.length ?? 0}` : json.error?.message ?? "Ошибка импорта");
  }

  return (
    <div className="grid gap-5">
      <form action={upload} className="rounded-lg border border-slate-200 bg-white p-5">
        <label className="block">
          <span className="mb-2 block font-semibold">CSV или ZIP</span>
          <input name="file" type="file" accept=".csv,.zip" required className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>
        <Button className="mt-3" disabled={loading}>{loading ? "Проверка..." : "Загрузить и проверить"}</Button>
      </form>
      {result && !result.success && <div className="rounded-lg bg-rose-50 p-4 text-rose-700">{result.error?.message}</div>}
      {result?.data && (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">Предварительный просмотр</h2>
          <p className="mt-2">Файл: {result.data.batch.originalFileName}</p>
          <p>Строк: {result.data.batch.totalRows}</p>
          <p>Ошибок: {result.data.preview.errors.length}</p>
          {result.data.preview.warnings.length > 0 && (
            <div className="mt-3 rounded-md bg-amber-50 p-3">
              <h3 className="font-bold">Предупреждения</h3>
              {result.data.preview.warnings.map((w, i) => <p key={i}>Строка {w.row}: {w.field} — {w.message}</p>)}
            </div>
          )}
          {result.data.preview.errors.length > 0 && (
            <div className="mt-3 rounded-md bg-rose-50 p-3 text-rose-800">
              <h3 className="font-bold">Критические ошибки</h3>
              {result.data.preview.errors.map((e, i) => <p key={i}>Строка {e.row ?? "-"}: {e.field ?? "-"} — {e.message}{e.existingNumber ? `, существующее №${e.existingNumber}` : ""}</p>)}
            </div>
          )}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead><tr>{["CSV строка", "Номер", "Категория", "Сложность", "Условие", "Изображения"].map((h) => <th key={h} className="border-b p-2">{h}</th>)}</tr></thead>
              <tbody>
                {result.data.preview.prepared.slice(0, 20).map((row) => (
                  <tr key={row.row}>
                    <td className="border-b p-2">{row.row}</td>
                    <td className="border-b p-2">{row.number}</td>
                    <td className="border-b p-2">{row.categoryName}</td>
                    <td className="border-b p-2">{row.difficulty}</td>
                    <td className="border-b p-2">{row.conditionMarkdown}</td>
                    <td className="border-b p-2">{row.images.map((i) => i.fileName).join(", ") || "нет"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-4" disabled={loading || result.data.preview.errors.length > 0} onClick={commit}>Подтвердить импорт</Button>
          {message && <p className="mt-3 font-semibold text-indigo-700">{message}</p>}
        </section>
      )}
    </div>
  );
}
