import { Link } from "react-router";

function Seccion({ titulo, children }) {
  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm mb-5">
      <h2 className="font-black text-lg text-[#2B2B2B] mb-3">{titulo}</h2>
      <div className="text-sm text-[#8a7a80] leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-[#FFECF2] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-black text-3xl text-[#2B2B2B] mb-2">Política de privacidad</h1>
          <p className="text-sm text-[#8a7a80]">
            Última actualización: septiembre de 2026. Aplica al uso de la plataforma Sanos y Salvos.
          </p>
        </div>

        <Seccion titulo="1. Responsable del tratamiento">
          <p>
            Sanos y Salvos es una plataforma comunitaria que conecta a personas para ayudar a
            reunir mascotas perdidas con sus familias. Los datos personales que recibimos se
            tratan conforme a la <strong>Ley N° 21.719</strong>, que regula la protección y el
            tratamiento de los datos personales en Chile, y a la <strong>Ley N° 21.663</strong>
            (Ley Marco de Ciberseguridad).
          </p>
        </Seccion>

        <Seccion titulo="2. Qué datos recopilamos y para qué">
          <p>
            Al iniciar sesión (con Google o con correo y contraseña a través de AWS Cognito),
            recopilamos tu correo electrónico y un identificador único de cuenta. Este dato se
            usa exclusivamente para autenticarte y para identificar quién reportó o contactó
            sobre una mascota.
          </p>
          <p>
            Cuando reportas una mascota, además guardamos: nombre, especie, fotografía,
            descripción, comuna aproximada y, si corresponde, un correo de contacto y
            características adicionales que decidas incluir (raza, color, tamaño, etc.).
          </p>
        </Seccion>

        <Seccion titulo="3. Minimización de datos">
          <p>
            Aplicamos el principio de minimización de datos exigido por la Ley N° 21.719: la
            plataforma nunca expone públicamente tu correo de contacto ni tu identificador de
            usuario en las respuestas de la API ni en las páginas de listado o detalle de una
            mascota. Esos datos solo se usan internamente para permitir que otra persona te
            contacte a través de la plataforma, sin revelar tu información directamente.
          </p>
        </Seccion>

        <Seccion titulo="4. Tus derechos (ARCO+)">
          <p>
            Conforme a la Ley N° 21.719, puedes ejercer en cualquier momento tus derechos de
            <strong> acceso, rectificación, cancelación, oposición y portabilidad</strong> sobre
            tus datos personales, escribiendo a{" "}
            <a href="mailto:contacto@sanosysalvos.cl" className="text-[#C46081] font-semibold hover:underline">
              contacto@sanosysalvos.cl
            </a>
            . Responderemos dentro de los plazos que establece la ley.
          </p>
        </Seccion>

        <Seccion titulo="5. Seguridad de la información">
          <p>
            La autenticación se delega en AWS Cognito, que valida las credenciales y emite
            tokens firmados (JWT) verificados en cada solicitud. Las contraseñas nunca se
            almacenan ni transitan en texto plano por nuestros sistemas: el login con
            correo y contraseña usa el protocolo SRP (Secure Remote Password), que prueba la
            contraseña sin transmitirla.
          </p>
          <p>
            Estas prácticas siguen los lineamientos de gestión de seguridad de la información
            de la norma <strong>ISO/IEC 27001:2022</strong> (control de acceso, cifrado en
            tránsito, minimización de datos expuestos) y las obligaciones de gestión de
            incidentes de ciberseguridad de la <strong>Ley N° 21.663</strong>.
          </p>
        </Seccion>

        <Seccion titulo="6. Calidad y confiabilidad del servicio">
          <p>
            El diseño de la plataforma considera los atributos de calidad definidos en la norma
            <strong> ISO/IEC 25010</strong>: seguridad (control de acceso y confidencialidad de
            los datos), fiabilidad (validación de disponibilidad de los servicios antes de
            responder), usabilidad y mantenibilidad de la arquitectura de microservicios.
          </p>
        </Seccion>

        <Seccion titulo="7. Conservación de los datos">
          <p>
            Conservamos los datos de tu cuenta y tus reportes mientras mantengas tu cuenta
            activa o mientras sean necesarios para el propósito de reunificación de mascotas.
            Puedes solicitar la eliminación de tus datos en cualquier momento.
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
