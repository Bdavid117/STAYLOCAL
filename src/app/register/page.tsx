import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex-grow flex items-center justify-center p-gutter pt-12 pb-stack-lg min-h-[calc(100vh-80px-200px)]">
      <div className="w-full max-w-md bg-paper rounded-xl shadow-[0_4px_24px_rgba(210,105,30,0.08)] border border-line overflow-hidden">
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-headline-md text-headline-md text-ink mb-2">Crear Cuenta</h1>
            <p className="font-body-sm text-body-sm text-ink-soft">Únete a la comunidad de locales informados y viajeros curiosos.</p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-ink-soft">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-terracotta hover:text-terracotta-deep font-medium transition-colors underline decoration-transparent hover:decoration-terracotta-deep underline-offset-4">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
        
        <div className="bg-bone-2 p-4 text-center border-t border-line">
          <p className="font-body-sm text-[12px] text-ink-mute">
            Al registrarte, aceptas nuestros <a href="#" className="underline">Términos</a> y <a href="#" className="underline">Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

