import { AuthShell } from "@/components/ui/AuthShell";
import { ResetForm } from "./reset-form";

type Props = { params: Promise<{ token: string }> };

export default async function ResetPage({ params }: Props) {
  const { token } = await params;
  return (
    <AuthShell
      serial="§A·04"
      kicker="Nueva contraseña"
      title={
        <>
          Define una <em className="italic text-terracotta">nueva</em>.
        </>
      }
      subtitle="Elige una contraseña que recuerdes. El enlace anterior dejará de funcionar después de este cambio."
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
