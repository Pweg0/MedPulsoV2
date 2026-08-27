import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FlashcardBrowser } from "@/components/flashcards/flashcard-browser";
import { getCurrentUser } from "@/lib/supabase/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Flashcard } from "@/components/flashcards/flashcard-browser";

export const metadata: Metadata = {
  title: "Flashcards — MedPulso.ia",
};

export default async function FlashcardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", user.id)
    .order("area_grande", { ascending: true })
    .order("created_at", { ascending: false });

  const flashcards = (data as Flashcard[] | null) ?? [];

  return (
    <Container className="max-w-none py-16 lg:px-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl tracking-tight text-text-primary">
          Flashcards
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Gerados automaticamente toda vez que você erra uma questão.
        </p>
      </div>

      {flashcards.length > 0 ? (
        <FlashcardBrowser flashcards={flashcards} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-text-tertiary">
          Nenhum flashcard ainda. Eles aparecem aqui automaticamente quando
          você erra uma questão no banco.
        </div>
      )}
    </Container>
  );
}
