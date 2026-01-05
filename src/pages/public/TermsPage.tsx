import { FileText } from "lucide-react";
import logo from "../../assets/logo.png";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="TrabajoYa" className="mx-auto h-20 mb-4" />
          <div className="flex items-center justify-center mb-2">
            <FileText className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">
              Términos y Condiciones
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            TrabajoYa - Última actualización: Enero 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700">
              Al acceder y usar <strong>TrabajoYa</strong> ("la app", "el
              servicio"), aceptas estar sujeto a estos Términos y Condiciones.
              Si no estás de acuerdo con alguna parte de estos términos, no
              debes usar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              2. Descripción del Servicio
            </h2>
            <p className="text-gray-700">
              TrabajoYa es una plataforma de empleo que conecta postulantes
              (candidatos) con empresas. La plataforma permite a los postulantes
              buscar empleos, aplicar a posiciones, y comunicarse con empresas.
              Las empresas pueden publicar ofertas de trabajo, revisar
              aplicaciones y comunicarse con postulantes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              3. Registro y Cuenta
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.1. Elegibilidad
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Debes tener al menos 18 años de edad para usar TrabajoYa</li>
              <li>Debes proporcionar información veraz y precisa</li>
              <li>
                Eres responsable de mantener la confidencialidad de tu cuenta
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.2. Tipos de Cuenta
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Postulante:</strong> Para candidatos que buscan empleo
              </li>
              <li>
                <strong>Empresa:</strong> Para empresas que buscan contratar
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              4. Uso Aceptable
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              4.1. Prohibiciones
            </h3>
            <p className="text-gray-700 mb-4">No debes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Proporcionar información falsa o engañosa</li>
              <li>Usar la app para actividades ilegales</li>
              <li>Harassment, discriminación o comportamiento abusivo</li>
              <li>
                Compartir información de contacto antes de que se establezca una
                relación laboral
              </li>
              <li>
                Publicar contenido ofensivo, discriminatorio o inapropiado
              </li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Usar bots, scripts o métodos automatizados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              5. Contenido del Usuario
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5.1. Propiedad
            </h3>
            <p className="text-gray-700 mb-4">
              Conservas la propiedad de todo el contenido que subes a TrabajoYa
              (CVs, videos, fotos, mensajes). Sin embargo, al usar la app,
              otorgas a TrabajoYa una licencia para usar, mostrar y distribuir
              tu contenido dentro de la plataforma.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5.2. Moderación
            </h3>
            <p className="text-gray-700">
              Nos reservamos el derecho de moderar, editar o eliminar cualquier
              contenido que viole estos términos o nuestras políticas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              6. Pagos y Suscripciones
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Las empresas pueden necesitar suscripciones para publicar
                empleos premium
              </li>
              <li>Los pagos se procesan a través de PayPal</li>
              <li>
                Las suscripciones se renuevan automáticamente a menos que se
                cancelen
              </li>
              <li>
                Los reembolsos se manejan según nuestra política de reembolsos
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              7. Privacidad
            </h2>
            <p className="text-gray-700">
              El uso de tu información personal se rige por nuestra{" "}
              <a
                href="/public/privacy"
                className="text-blue-600 hover:underline"
              >
                Política de Privacidad
              </a>
              . Al usar TrabajoYa, aceptas nuestra recopilación y uso de
              información según se describe en esa política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              8. Propiedad Intelectual
            </h2>
            <p className="text-gray-700">
              Todos los derechos de propiedad intelectual de TrabajoYa,
              incluyendo pero no limitado a logos, diseño, código y contenido,
              son propiedad de TrabajoYa o sus licenciantes. No puedes copiar,
              modificar o distribuir ningún contenido sin permiso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              9. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 mb-4">
              TrabajoYa actúa como intermediario entre postulantes y empresas.
              No garantizamos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>La veracidad de la información proporcionada por usuarios</li>
              <li>El éxito de las aplicaciones o contrataciones</li>
              <li>La disponibilidad continua del servicio</li>
              <li>La ausencia de errores o interrupciones</li>
            </ul>
            <p className="text-gray-700 mt-4">
              TrabajoYa no es responsable de disputas entre postulantes y
              empresas, pérdidas financieras, o daños resultantes del uso del
              servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              10. Terminación
            </h2>
            <p className="text-gray-700 mb-4">
              Podemos suspender o terminar tu cuenta si:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Violas estos términos</li>
              <li>Realizas actividades fraudulentas o ilegales</li>
              <li>No usas la cuenta durante un período prolongado</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Puedes eliminar tu cuenta en cualquier momento desde la
              configuración de la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              11. Cambios a los Términos
            </h2>
            <p className="text-gray-700">
              Podemos modificar estos términos en cualquier momento. Te
              notificaremos sobre cambios significativos. El uso continuado de
              TrabajoYa después de los cambios constituye tu aceptación de los
              nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              12. Ley Aplicable
            </h2>
            <p className="text-gray-700">
              Estos términos se rigen por las leyes del país donde opera
              TrabajoYa. Cualquier disputa se resolverá en los tribunales
              competentes de esa jurisdicción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              13. Contacto
            </h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, puedes
              contactarnos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:legal@trabajoya.com"
                  className="text-blue-600 hover:underline"
                >
                  legal@trabajoya.com
                </a>
              </li>
              <li>
                <strong>Soporte:</strong>{" "}
                <a
                  href="mailto:soporte@trabajoya.com"
                  className="text-blue-600 hover:underline"
                >
                  soporte@trabajoya.com
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 border-t pt-8 mt-8">
          <p className="font-semibold text-gray-800 mb-2">
            <strong>TrabajoYa</strong> - Plataforma de empleo que conecta
            postulantes con empresas
          </p>
          <p>© 2025 TrabajoYa. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
