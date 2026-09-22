import { Link } from "react-router";

function Seccion({ titulo, children }) {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm mb-5">
      <h2 className="font-black text-lg text-[#2B2B2B] mb-3">{titulo}</h2>
      <div className="text-sm text-[#8a7a80] leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function Terminos() {
  return (
    <div className="min-h-screen bg-[#FFECF2] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-black text-3xl text-[#2B2B2B] mb-2">Términos de servicio</h1>
          <p className="text-sm text-[#8a7a80]">Última actualización: septiembre de 2026.</p>
        </div>

        <Seccion titulo="1. Qué es Sanos y Salvos">
          <p>
            Sanos y Salvos es una plataforma comunitaria, sin fines de lucro, que ayuda a
            conectar a personas que perdieron o encontraron una mascota. No somos intermediarios
            de una transacción comercial ni garantizamos el resultado de una búsqueda.
          </p>
        </Seccion>

        <Seccion titulo="2. Uso responsable">
          <p>
            Al usar la plataforma, te comprometes a ingresar información verídica en tus
            reportes, a no usar los datos de contacto de otras personas para fines distintos a
            la reunificación de mascotas, y a respetar la privacidad de quienes reportan o
            responden a un reporte.
          </p>
        </Seccion>

        <Seccion titulo="3. Cuentas de usuario">
          <p>
            Para reportar una mascota necesitas una cuenta, autenticada mediante Google o con
            correo y contraseña. Eres responsable de mantener la confidencialidad de tu
            contraseña y de la actividad que ocurra desde tu cuenta.
          </p>
        </Seccion>

        <Seccion titulo="4. Contenido publicado">
          <p>
            Al publicar un reporte (fotos, descripción, ubicación aproximada), nos das permiso
            para mostrar esa información públicamente en la plataforma con el único fin de
            ayudar a encontrar a la mascota. Puedes eliminar tu reporte en cualquier momento.
          </p>
        </Seccion>

        <Seccion titulo="5. Limitación de responsabilidad">
          <p>
            Sanos y Salvos facilita el contacto entre personas, pero no participa ni se hace
            responsable de los acuerdos, encuentros o transacciones que resulten de esos
            contactos.
          </p>
        </Seccion>

        <Seccion titulo="6. Cambios a estos términos">
          <p>
            Podemos actualizar estos términos ocasionalmente. Los cambios importantes se
            comunicarán a través de la plataforma.
          </p>
        </Seccion>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#C46081] font-semibold hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
