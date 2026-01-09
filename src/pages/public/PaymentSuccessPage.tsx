import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo120.png';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [redirected, setRedirected] = useState(false);

  // Obtener parámetros de PayPal
  const token = searchParams.get('token') || searchParams.get('PayerID');
  const orderId = searchParams.get('orderId') || token;

  useEffect(() => {
    // Construir el deep link para la app móvil
    const deepLink = `trabajoya://payment/success${orderId ? `?orderId=${orderId}` : ''}${token ? `&token=${token}` : ''}`;

    // Intentar redirigir a la app móvil
    const redirectToApp = () => {
      if (!redirected) {
        setRedirected(true);
        window.location.href = deepLink;
      }
    };

    // Contador regresivo antes de redirigir
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Intentar redirigir inmediatamente (para usuarios en móvil)
    redirectToApp();

    return () => clearInterval(timer);
  }, [orderId, token, redirected]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <img src={logo} alt="TrabajoYa" className="mx-auto h-16 mb-4" />
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-600 mb-6">
          Tu pago se ha procesado correctamente. Redirigiendo a la aplicación...
        </p>
        {countdown > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            Redirigiendo en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        )}
        <div className="space-y-3">
          <a
            href={`trabajoya://payment/success${orderId ? `?orderId=${orderId}` : ''}${token ? `&token=${token}` : ''}`}
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Abrir en la aplicación
          </a>
          <p className="text-xs text-gray-500">
            Si no se abre automáticamente, haz clic en el botón de arriba
          </p>
        </div>
      </div>
    </div>
  );
}

