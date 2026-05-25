"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-body-md text-body-md font-medium py-3 px-4 rounded-lg shadow-soft transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
        <span>{pending ? "Creando…" : "Crear Cuenta"}</span>
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="p-4 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm">{state.error}</div>}
      
      <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-ink uppercase">Quiero...</label>
          <div className="grid grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                  <input defaultChecked className="peer sr-only" name="role" type="radio" value="guest"/>
                  <div className="p-4 border border-line rounded-lg text-center peer-checked:border-terracotta peer-checked:bg-bone-2 transition-all">
                      <span className="material-symbols-outlined block mb-1 text-terracotta">luggage</span>
                      <span className="font-body-sm text-body-sm font-medium">Viajar</span>
                  </div>
              </label>
              <label className="relative cursor-pointer">
                  <input className="peer sr-only" name="role" type="radio" value="host"/>
                  <div className="p-4 border border-line rounded-lg text-center peer-checked:border-terracotta peer-checked:bg-bone-2 transition-all">
                      <span className="material-symbols-outlined block mb-1 text-terracotta">house</span>
                      <span className="font-body-sm text-body-sm font-medium">Hospedar</span>
                  </div>
              </label>
          </div>
      </div>

      <div className="space-y-1">
          <label className="block font-label-caps text-label-caps text-ink uppercase" htmlFor="name">Nombre Completo</label>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-ink-mute text-opacity-50 text-[20px]">person</span>
              </div>
              <input required id="name" name="name" placeholder="Tu Nombre" type="text" className="block w-full pl-10 pr-3 py-3 border border-line rounded-lg bg-paper font-body-md text-body-md text-ink focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-shadow placeholder:text-ink-mute" />
          </div>
      </div>

      <div className="space-y-1">
          <label className="block font-label-caps text-label-caps text-ink uppercase" htmlFor="email">Correo Electrónico</label>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-ink-mute text-opacity-50 text-[20px]">mail</span>
              </div>
              <input required id="email" name="email" placeholder="tu@correo.com" type="email" className="block w-full pl-10 pr-3 py-3 border border-line rounded-lg bg-paper font-body-md text-body-md text-ink focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-shadow placeholder:text-ink-mute" />
          </div>
      </div>

      <div className="space-y-1">
          <label className="block font-label-caps text-label-caps text-ink uppercase" htmlFor="password">Contraseña</label>
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-ink-mute text-opacity-50 text-[20px]">lock</span>
              </div>
              <input required id="password" name="password" placeholder="••••••••" type={showPassword ? "text" : "password"} minLength={8} className="block w-full pl-10 pr-10 py-3 border border-line rounded-lg bg-paper font-body-md text-body-md text-ink focus:ring-2 focus:ring-terracotta focus:border-terracotta transition-shadow placeholder:text-ink-mute" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-mute hover:text-ink transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
          </div>
          <p className="font-body-sm text-[12px] text-ink-mute mt-1">Mínimo 8 caracteres.</p>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
