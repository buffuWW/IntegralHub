import { AdminShell } from "@/components/admin/AdminShell";
import { ImportPanel } from "@/components/admin/ImportPanel";

export default function ImportPage() {
  return (
    <AdminShell>
      <h1 className="mb-5 text-3xl font-black">Импорт CSV/ZIP</h1>
      <ImportPanel />
    </AdminShell>
  );
}
