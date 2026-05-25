import Link from "next/link";
import { auth } from "@/shared/auth";

export default async function HostRegisterPage() {
    const session = await auth();

    return (
        <main className="flex-grow flex items-center justify-center min-h-screen p-4 md:p-8 mt-16 md:mt-0">
            <div className="bg-paper rounded-xl shadow-warm flex flex-col md:flex-row w-full max-w-container-max overflow-hidden" style={{ minHeight: '80vh' }}>
                {/* Left Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-prose mx-auto w-full">
                        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-ink mb-2">Conviértete en Anfitrión</h1>
                        <p className="font-body-md text-body-md text-ink-soft mb-8">Únete a la comunidad de StayLocal y comparte tu espacio con viajeros informados.</p>
                        
                        <form className="space-y-6" action="/host/stays/new">
                            {/* Step 1: Personal Details */}
                            <div className="space-y-4">
                                <h2 className="font-headline-md text-headline-md text-ink border-b border-line-hair pb-2">1. Detalles Personales</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-ink-soft mb-1 uppercase tracking-wider" htmlFor="firstName">Nombre</label>
                                        <input required className="w-full bg-paper border border-line rounded-lg px-4 py-3 font-body-md text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition-shadow" id="firstName" placeholder="Jane" type="text" />
                                    </div>
                                    <div>
                                        <label className="block font-label-caps text-label-caps text-ink-soft mb-1 uppercase tracking-wider" htmlFor="lastName">Apellido</label>
                                        <input required className="w-full bg-paper border border-line rounded-lg px-4 py-3 font-body-md text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition-shadow" id="lastName" placeholder="Doe" type="text" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-ink-soft mb-1 uppercase tracking-wider" htmlFor="email">Correo Electrónico</label>
                                    <input required className="w-full bg-paper border border-line rounded-lg px-4 py-3 font-body-md text-body-md text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition-shadow" id="email" placeholder="jane@example.com" type="email" />
                                </div>
                            </div>
                            
                            {/* Step 2: Experience */}
                            <div className="space-y-4 pt-4">
                                <h2 className="font-headline-md text-headline-md text-ink border-b border-line-hair pb-2">2. Experiencia Hospedando</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="cursor-pointer">
                                        <input defaultChecked className="peer sr-only" name="experience" type="radio" value="new" />
                                        <div className="border border-line rounded-xl p-4 peer-checked:border-terracotta peer-checked:bg-bone-2 transition-all hover:bg-bone-2 flex flex-col items-center text-center gap-2 h-full">
                                            <span className="material-symbols-outlined text-terracotta text-3xl">home_work</span>
                                            <span className="font-body-md text-body-md text-ink font-medium">Soy nuevo hospedando</span>
                                            <span className="font-body-sm text-body-sm text-ink-soft">Apenas empiezo mi viaje.</span>
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input className="peer sr-only" name="experience" type="radio" value="experienced" />
                                        <div className="border border-line rounded-xl p-4 peer-checked:border-terracotta peer-checked:bg-bone-2 transition-all hover:bg-bone-2 flex flex-col items-center text-center gap-2 h-full">
                                            <span className="material-symbols-outlined text-terracotta text-3xl">verified_user</span>
                                            <span className="font-body-md text-body-md text-ink font-medium">Tengo experiencia</span>
                                            <span className="font-body-sm text-body-sm text-ink-soft">He hospedado antes.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Step 3: Property Type */}
                            <div className="space-y-4 pt-4">
                                <h2 className="font-headline-md text-headline-md text-ink border-b border-line-hair pb-2">3. Tipo de Propiedad</h2>
                                <div>
                                    <label className="block font-label-caps text-label-caps text-ink-soft mb-1 uppercase tracking-wider" htmlFor="propertyType">¿Qué tipo de espacio vas a publicar?</label>
                                    <div className="relative">
                                        <select required className="w-full bg-paper border border-line rounded-lg px-4 py-3 font-body-md text-body-md text-ink appearance-none focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent cursor-pointer" id="propertyType" defaultValue="">
                                            <option disabled value="">Selecciona el tipo de propiedad</option>
                                            <option value="entire_home">Casa entera</option>
                                            <option value="private_room">Habitación privada</option>
                                            <option value="guesthouse">Casa de huéspedes</option>
                                            <option value="unique_space">Espacio único (Cabaña, etc.)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink-soft">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-6">
                                <button className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-body-lg text-body-lg py-4 rounded-xl shadow-soft transition-colors duration-200" type="submit">
                                    Empezar a Hospedar
                                </button>
                            </div>
                            
                            {!session?.user?.id && (
                                <div className="text-center pt-4">
                                    <p className="font-body-sm text-body-sm text-ink-soft">
                                        ¿Ya tienes una cuenta?{" "}
                                        <Link href="/login" className="text-terracotta font-medium hover:underline">
                                            Inicia sesión
                                        </Link>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Side: Imagery */}
                <div className="hidden md:block md:w-1/2 relative bg-bone-2">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtPdbpvI8pLprASuXM11oQqqpoPQzkzapiHJ7xU3u6E-lPnFZyGtM0FPx1aqIaNTgPyydssT8N9BePZ6V01oMo_yhZqjiIyz1iwjPA5K3DjbNAJSFa_TKi0Mo9Xa9qzR0Fqh7jhNkdelckn7ZKP4O2b0zZmu2dT0W8y-6D_NCqgIRVrKjOmX9IgiBrAT7T6PVtODkNLrFCsg90WMJuy6a29GMUWHg7ENnpzXpLmVivvbnXotqoemftobwqY_YQCsrPP-1Da4GmbEM')" }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent"></div>
                    </div>
                    {/* Floating Card Detail over image */}
                    <div className="absolute bottom-12 left-12 right-12 bg-paper/90 backdrop-blur-md p-6 rounded-xl shadow-warm border border-line-hair">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center text-white flex-shrink-0">
                                <span className="material-symbols-outlined">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="font-headline-md text-headline-md text-ink mb-1">Comparte la Experiencia Local</h3>
                                <p className="font-body-sm text-body-sm text-ink-soft">Hospedar en StayLocal te conecta con viajeros detallistas que aprecian la autenticidad de tu barrio.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
