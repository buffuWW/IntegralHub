"use client";

import { Button, LinkButton } from "@/components/ui/Button";

export function AdminTaskActions({ id }: { id: string }) {
  async function action(path: string, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    await fetch(`/api/admin/tasks/${id}/${path}`, { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href={`/admin/tasks/${id}/edit`} variant="secondary" className="min-h-9 px-3 py-1">Редактировать</LinkButton>
      <Button variant="secondary" className="min-h-9 px-3 py-1" onClick={() => action("publish")}>Опубликовать</Button>
      <Button variant="secondary" className="min-h-9 px-3 py-1" onClick={() => action("hide")}>Скрыть</Button>
      <Button variant="danger" className="min-h-9 px-3 py-1" onClick={() => action("archive", "Переместить задание в архив?")}>В архив</Button>
    </div>
  );
}
