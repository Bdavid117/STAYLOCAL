import { ResetForm } from "./reset-form";

type Props = { params: Promise<{ token: string }> };

export default async function ResetPage({ params }: Props) {
  const { token } = await params;
  return (
    <section className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Nueva contraseña</h1>
      <ResetForm token={token} />
    </section>
  );
}
