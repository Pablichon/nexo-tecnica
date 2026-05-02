import Link from 'next/link';

export default function TerminosCondiciones() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header con diseño mejorado */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                        Legal
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Términos y Condiciones
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Al utilizar Nexo Técnica, aceptas los siguientes términos
                    </p>
                </div>

                {/* Card principal con sombra mejorada */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

                    {/* Barra de color superior */}
                    <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-700 to-gray-800"></div>

                    <div className="p-8 md:p-12 space-y-10">

                        {/* Sección 1 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">📱</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        1. Naturaleza del Servicio
                                    </h2>
                                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-orange-400">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            "Nexo Técnica" funciona exclusivamente como un <strong className="text-blue-600">directorio digital de proveedores industriales</strong>.
                                            Su único fin es facilitar la conexión entre empresas y proveedores técnicos. La plataforma <strong className="text-blue-600">no participa,
                                                no interviene, ni cobra comisiones</strong> por las transacciones que puedan realizarse entre las partes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Separador visual */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <span className="text-gray-400">•</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        {/* Sección 2 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        2. Deslinde de Responsabilidad
                                    </h2>
                                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-400">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            "Nexo Técnica" <strong className="text-blue-600">no es responsable</strong> por la calidad, estado, integridad o legalidad
                                            de los productos y servicios ofrecidos por los negocios registrados, así como tampoco por la veracidad
                                            de la información provista por ellos. Cualquier reclamo relacionado con la compra o contratación debe
                                            dirigirse <strong className="text-blue-600">exclusivamente al proveedor vendedor</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Separador visual */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <span className="text-gray-400">•</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        {/* Sección 3 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                    <span className="text-2xl">🤝</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        3. Relación entre Usuarios
                                    </h2>
                                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-400">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            Toda transacción, pago, entrega o acuerdo se realiza de forma <strong className="text-green-600">privada y directa entre el
                                                comprador y el vendedor</strong> (generalmente vía WhatsApp). Nexo Técnica <strong className="text-green-600">no actúa como
                                                    intermediario financiero ni garante</strong> de ninguna operación.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Separador visual */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <span className="text-gray-400">•</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        {/* Sección 4 */}
                        <section className="group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        4. Privacidad de Datos
                                    </h2>
                                    <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-purple-400">
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            Los datos de contacto (como el número de WhatsApp) publicados por los comercios son de
                                            <strong className="text-purple-600"> acceso público</strong> para los fines de la aplicación. Al registrar su empresa, el usuario
                                            acepta que esta información sea visible para los potenciales clientes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Footer de aceptación */}
                        <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-200">
                            <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-2xl p-6 text-center">
                                <p className="text-gray-700 text-lg font-medium">
                                    ✓ Al utilizar <strong className="text-blue-600">Nexo Técnica</strong>, aceptas estos términos en su totalidad
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de volver mejorado */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-full transition transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        <span className="text-xl">←</span>
                        <span>Volver al Inicio</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
