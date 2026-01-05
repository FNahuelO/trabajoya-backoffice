import { AlertTriangle } from "lucide-react";
import logo from "../../assets/logo.png";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="TrabajoYa" className="mx-auto h-20 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Eliminar mi cuenta - TrabajoYa
          </h1>
          <p className="text-lg text-gray-600">
            Los usuarios de <strong>TrabajoYa</strong> pueden eliminar su cuenta
            y todos sus datos asociados directamente desde la aplicación móvil.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 mb-1">
                ⚠️ Importante
              </p>
              <p className="text-yellow-700">
                La eliminación de cuenta es{" "}
                <strong>permanente e irreversible</strong>. Una vez eliminada tu
                cuenta, no podrás recuperar tus datos.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ¿Cómo eliminar mi cuenta?
          </h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                Abre la aplicación <strong>TrabajoYa</strong> en tu dispositivo
                móvil
              </li>
              <li>
                Ve a la sección <strong>Configuración</strong> (⚙️)
              </li>
              <li>
                Desplázate hasta la sección <strong>Cuenta</strong>
              </li>
              <li>
                Toca en <strong>"Eliminar cuenta"</strong>
              </li>
              <li>Confirma la eliminación cuando se te solicite</li>
            </ol>
          </div>
        </div>

        {/* Data Deletion */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ¿Qué datos se eliminan?
          </h2>
          <p className="text-gray-700 mb-4">
            Al eliminar tu cuenta, se eliminarán{" "}
            <strong>permanentemente</strong> todos los siguientes datos:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Información de perfil:</strong> Nombre, email, foto de
              perfil, información de contacto
            </li>
            <li>
              <strong>Datos profesionales:</strong> CV, video de presentación,
              experiencia laboral, educación, certificaciones, habilidades
            </li>
            <li>
              <strong>Aplicaciones:</strong> Todas tus postulaciones a empleos
            </li>
            <li>
              <strong>Mensajes:</strong> Todos los mensajes enviados y recibidos
            </li>
            <li>
              <strong>Llamadas:</strong> Historial de llamadas y reuniones de
              video
            </li>
            <li>
              <strong>Preferencias:</strong> Configuraciones de notificación y
              preferencias de la app
            </li>
            <li>
              <strong>Archivos:</strong> Todos los archivos subidos (CVs,
              videos, fotos)
            </li>
          </ul>
        </div>

        {/* Data Retention */}
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ¿Qué datos se conservan?
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Datos de pago:</strong> Si realizaste pagos a través de
              PayPal, se conservarán los registros de transacciones según los
              requisitos legales y fiscales (período de retención: 7 años según
              normativa fiscal)
            </li>
            <li>
              <strong>Datos anonimizados:</strong> Podemos conservar datos
              agregados y anonimizados para análisis estadísticos
            </li>
          </ul>
        </div>

        {/* Retention Period */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Período de retención
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Eliminación inmediata:</strong> La mayoría de los datos se
              eliminan inmediatamente al confirmar la eliminación de la cuenta
            </li>
            <li>
              <strong>Eliminación completa:</strong> Todos los datos se eliminan
              completamente de nuestros servidores en un plazo máximo de{" "}
              <strong>30 días</strong>
            </li>
            <li>
              <strong>Datos de pago:</strong> Se conservan durante{" "}
              <strong>7 años</strong> según requisitos legales y fiscales
            </li>
          </ul>
        </div>

        {/* Recovery */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ¿Puedo recuperar mi cuenta después de eliminarla?
          </h2>
          <p className="text-gray-700">
            <strong>No.</strong> La eliminación de cuenta es{" "}
            <strong>permanente e irreversible</strong>. Una vez eliminada tu
            cuenta, no podrás recuperar tus datos.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-gray-700 mb-4">
            Si tienes problemas para eliminar tu cuenta o tienes preguntas sobre
            el proceso de eliminación, puedes contactarnos:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:soporte@trabajoya.com"
                className="text-blue-600 hover:underline"
              >
                soporte@trabajoya.com
              </a>
            </li>
            <li>
              <strong>Desde la app:</strong> Configuración → Ayuda y Soporte
            </li>
          </ul>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">
            Información adicional
          </h2>
          <p className="text-gray-700 mb-4">
            Para más información sobre cómo manejamos tus datos, consulta:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>
              <a
                href="/public/privacy"
                className="text-blue-600 hover:underline"
              >
                Política de Privacidad
              </a>
            </li>
            <li>
              <a href="/public/terms" className="text-blue-600 hover:underline">
                Términos y Condiciones
              </a>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 border-t pt-8">
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
