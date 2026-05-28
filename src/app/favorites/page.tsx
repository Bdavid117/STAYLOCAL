import { auth } from "@/shared/auth";
import { staysDeps } from "@/modules/stays/composition";
import { listFavorites } from "@/modules/stays/services/list-favorites";
import { Container, SectionLabel } from "@/components/ui/Container";
import { StayCard } from "@/components/ui/StayCard";
import { redirect } from "next/navigation";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const results = await listFavorites(session.user.id, staysDeps());

  return (
    <Container size="wide" className="py-14">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <SectionLabel serial="§W">Wishlist</SectionLabel>
          <h1 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
            Tus <em className="italic text-terracotta">favoritos</em>.
          </h1>
          <p className="text-ink-soft">
            <span className="num">{results.length}</span> alojamiento
            {results.length === 1 ? "" : "s"} guardado
            {results.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-10">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-16 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">
              Lista vacía
            </p>
            <p className="mt-3 font-display text-3xl">Aún no has guardado nada.</p>
            <p className="mt-2 text-sm text-ink-soft">
              Explora el catálogo y haz clic en el corazón para guardar tus lugares favoritos.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s, i) => (
              <li key={s.id}>
                <StayCard 
                  stay={s} 
                  index={i} 
                  isFavorite={true}
                  showFavoriteButton={true}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
