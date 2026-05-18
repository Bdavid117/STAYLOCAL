import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/shared/require-auth";
import { staysDeps } from "@/modules/stays/composition";
import { deleteStayAction } from "@/app/host/stays/actions";
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
    <section className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar alojamiento</h1>
        <Link href="/host/stays" className="text-sm text-brand hover:underline">
          ← Volver
        </Link>
      </header>

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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Imágenes</h2>
        {stay.images.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay imágenes.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stay.images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-32 w-full object-cover" />
              </li>
            ))}
          </ul>
        )}
        <UploadImageForm stayId={id} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Disponibilidad</h2>
        <Link
          href={`/host/stays/${id}/availability`}
          className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Administrar calendario
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-red-700">Eliminar</h2>
        <form action={deleteAction}>
          <button
            type="submit"
            className="rounded border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            Eliminar alojamiento
          </button>
          <p className="mt-1 text-xs text-gray-500">
            No podrás eliminarlo si tiene reservas activas.
          </p>
        </form>
      </section>
    </section>
  );
}
