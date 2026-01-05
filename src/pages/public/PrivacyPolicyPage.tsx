import { Shield } from "lucide-react";
import logo from "../../assets/logo.png";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="TrabajoYa" className="mx-auto h-20 mb-4" />
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">
              Política de Privacidad
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
              1. Introducción
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>TrabajoYa</strong> ("nosotros", "nuestro", "la app") se
              compromete a proteger la privacidad de nuestros usuarios. Esta
              Política de Privacidad explica cómo recopilamos, usamos,
              compartimos y protegemos tu información personal cuando utilizas
              nuestra aplicación móvil y servicios.
            </p>
            <p className="text-gray-700">
              Al usar TrabajoYa, aceptas las prácticas descritas en esta
              política. Si no estás de acuerdo con esta política, por favor no
              uses nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              2. Información que Recopilamos
            </h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.1. Información que Proporcionas
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>
                <strong>Información de cuenta:</strong> Email, contraseña
                (encriptada), nombre completo
              </li>
              <li>
                <strong>Perfil profesional:</strong> CV, video de presentación,
                experiencia laboral, educación, certificaciones, habilidades
              </li>
              <li>
                <strong>Información de contacto:</strong> Número de teléfono,
                dirección, ciudad, país
              </li>
              <li>
                <strong>Información demográfica:</strong> Fecha de nacimiento,
                género, nacionalidad (opcional)
              </li>
              <li>
                <strong>Información de identificación:</strong> Tipo y número de
                documento (opcional)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.2. Información Generada Automáticamente
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>ID de usuario único</li>
              <li>Tokens de autenticación</li>
              <li>Metadatos de llamadas (fecha, duración, participantes)</li>
              <li>Preferencias de la aplicación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              3. Cómo Usamos tu Información
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Proporcionar servicios:</strong> Conectar postulantes
                con empresas, facilitar aplicaciones a empleos, mensajería,
                llamadas
              </li>
              <li>
                <strong>Mejorar la experiencia:</strong> Personalizar contenido,
                mejorar funcionalidades
              </li>
              <li>
                <strong>Comunicación:</strong> Enviar notificaciones,
                actualizaciones, emails transaccionales
              </li>
              <li>
                <strong>Seguridad:</strong> Prevenir fraudes, proteger cuentas,
                detectar actividades sospechosas
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> Cumplir con obligaciones
                legales y regulatorias
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              4. Compartir Información con Terceros
            </h2>
            <p className="text-gray-700 mb-4">
              Compartimos información limitada con los siguientes servicios de
              terceros:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Google:</strong> ID de Google para autenticación OAuth
                (solo si eliges iniciar sesión con Google)
              </li>
              <li>
                <strong>Apple:</strong> ID de Apple para autenticación OAuth
                (solo si eliges iniciar sesión con Apple)
              </li>
              <li>
                <strong>PayPal:</strong> Información de pago para procesar
                transacciones (no almacenamos datos de tarjetas)
              </li>
              <li>
                <strong>AWS SES:</strong> Direcciones de email para envío de
                emails transaccionales
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              <strong>
                No vendemos ni alquilamos tu información personal a terceros.
              </strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              5. Seguridad de Datos
            </h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger tu información:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Encriptación en tránsito:</strong> Todos los datos se
                transmiten mediante HTTPS/TLS
              </li>
              <li>
                <strong>Encriptación en reposo:</strong> Los datos se almacenan
                en bases de datos encriptadas
              </li>
              <li>
                <strong>Contraseñas:</strong> Se almacenan como hash (bcrypt),
                nunca en texto plano
              </li>
              <li>
                <strong>Acceso limitado:</strong> Solo personal autorizado tiene
                acceso a los datos
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              6. Retención de Datos
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Conservamos tus datos mientras tu cuenta esté activa y según sea
                necesario para proporcionar servicios
              </li>
              <li>
                Al eliminar tu cuenta, la mayoría de los datos se eliminan
                inmediatamente
              </li>
              <li>
                Eliminación completa de todos los datos en un plazo máximo de 30
                días
              </li>
              <li>
                Los datos de pago se conservan durante 7 años según requisitos
                legales y fiscales
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              7. Tus Derechos
            </h2>
            <p className="text-gray-700 mb-4">Tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Acceder:</strong> Solicitar una copia de tus datos
                personales
              </li>
              <li>
                <strong>Corregir:</strong> Actualizar o corregir información
                incorrecta
              </li>
              <li>
                <strong>Eliminar:</strong> Solicitar la eliminación de tu cuenta
                y datos
              </li>
              <li>
                <strong>Oponerte:</strong> Oponerte al procesamiento de tus
                datos para ciertos propósitos
              </li>
            </ul>
            <p className="text-gray-700 mt-4">
              Para ejercer estos derechos, puedes eliminar tu cuenta desde la
              app o contactarnos en{" "}
              <a
                href="mailto:soporte@trabajoya.com"
                className="text-blue-600 hover:underline"
              >
                soporte@trabajoya.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-700">
              Usamos tokens de autenticación y tecnologías similares para
              mantener tu sesión activa y mejorar la seguridad. Estos no se
              comparten con terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              9. Cambios a esta Política
            </h2>
            <p className="text-gray-700">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Te
              notificaremos sobre cambios significativos mediante la app o por
              email. La fecha de "Última actualización" al inicio de esta
              política indica cuándo se realizó la última revisión.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              10. Contacto
            </h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre esta Política de Privacidad o sobre cómo
              manejamos tus datos, puedes contactarnos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacidad@trabajoya.com"
                  className="text-blue-600 hover:underline"
                >
                  privacidad@trabajoya.com
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
