import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";
import { deleteStayAction } from "@/app/host/stays/actions";
import { Container, SectionLabel } from "@/components/ui/Container";
import { EditStayForm } from "./edit-form";
import { UploadImageForm } from "./upload-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditStayPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();

  const { stays } = staysDeps();
  const stay = await stays.findByIdWithImages(id);
  if (!stay || stay.status === "DELETED") notFound();
  if (stay.hostId !== session.user.id) redirect("/host/stays");

  const deleteAction = deleteStayAction.bind(null, id);

  return (
    <Container size="wide" className="py-14">
      <Link
        href="/host/stays"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink"
      >
        ← Volver al dashboard
      </Link>

      <header className="mb-10 space-y-3">
        <SectionLabel serial={`№ ${id.slice(-4).toUpperCase()}`}>Edición</SectionLabel>
        <h1 className="font-display text-5xl leading-tight">{stay.title}</h1>
        <p className="text-ink-soft">{stay.locationText}</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section className="space-y-8 lg:col-span-7">
          <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
            <EditStayForm
              stayId={id}
              initial={{
                title: stay.title,
                description: stay.description,
                pricePerNight: stay.pricePerNight,
                capacity: stay.capacity,
                lat: stay.lat,
                lng: stay.lng,
                locationText: stay.locationText,
                status: stay.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
              }}
            />
          </div>

          <div className="rounded-2xl border border-terracotta/30 bg-terracotta/[0.04] p-7">
            <SectionLabel serial="!">Zona crítica</SectionLabel>
            <h2 className="mt-3 font-display text-2xl">Eliminar este alojamiento</h2>
            <p className="mt-1 text-sm text-ink-soft">
              No se podrá eliminar si tiene reservas activas (pendientes o confirmadas).
              La acción es reversible solo por un administrador.
            </p>
            <form action={deleteAction} className="mt-4">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-md border border-terracotta/40 bg-paper px-4 text-sm text-terracotta-deep hover:bg-terracotta/10"
              >
                Eliminar alojamiento
              </button>
            </form>
          </div>
        </section>

        <aside className="space-y-8 lg:col-span-5">
          <div className="rounded-2xl border border-line bg-paper p-7 shadow-soft">
            <SectionLabel serial="§E·01">Galería</SectionLabel>
            <h2 className="mt-3 font-display text-2xl">Imágenes</h2>
            {stay.images.length === 0 ? (
              <p className="mt-3 text-sm text-ink-mute">
                Aún no hay imágenes. Sube la primera para que aparezca en el catálogo.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-3 gap-2">
                {stay.images.map((img) => (
                  <li key={img.id} className="overflow-hidden rounded-md border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-24 w-full object-cover" />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 border-t border-line pt-5">
              <UploadImageForm stayId={id} />
            </div>
          </div>

          <Link
            href={`/host/stays/${id}/availability`}
            className="block rounded-2xl border border-line bg-paper p-7 shadow-soft transition-colors hover:border-ink/30"
          >
            <SectionLabel serial="§E·02">Calendario</SectionLabel>
            <h2 className="mt-3 font-display text-2xl">Disponibilidad</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Bloquea fechas en las que no recibirás huéspedes.
            </p>
            <p className="mt-4 text-sm text-terracotta">Administrar calendario →</p>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
