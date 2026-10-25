/* PAMBI · Seguridad integral — interacciones del sitio */
(() => {
  const WHATSAPP = '593980445005';

  // Si conectas un servicio de formularios (Formspree, Getform, tu backend…),
  // pega aquí su URL y el formulario enviará los datos por POST en JSON.
  // Vacío = el formulario abre WhatsApp con la solicitud ya escrita.
  const FORM_ENDPOINT = '';

  /* Menú móvil */
  const toggle = document.querySelector('.header__toggle');
  const menu = document.getElementById('menu');

  const setMenu = (abierto) => {
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', abierto);
  };

  toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* Preseleccionar el formulario según el botón que se pulsó */
  const form = document.getElementById('form-contacto');
  const espacio = form.elements.espacio;
  const servicio = form.elements.servicio;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-espacio], [data-servicio]');
    if (!link) return;
    if (link.dataset.espacio) espacio.value = link.dataset.espacio;
    if (link.dataset.servicio) servicio.value = link.dataset.servicio;
  });

  /* Formulario de contacto */
  const nombre = form.elements.nombre;
  const telefono = form.elements.whatsapp;
  const consentimiento = form.elements.consentimiento;
  const boton = form.querySelector('.btn-enviar');
  const exito = document.getElementById('form-exito');

  const marcarError = (campo, mensaje) => {
    const error = document.getElementById(campo.getAttribute('aria-describedby'));
    error.textContent = mensaje;
    if (mensaje) campo.setAttribute('aria-invalid', 'true');
    else campo.removeAttribute('aria-invalid');
  };

  const validar = () => {
    const tel = telefono.value.replace(/\D/g, '');
    const errores = [
      [nombre, nombre.value.trim() ? '' : 'Escribe tu nombre para saber cómo llamarte.'],
      [telefono, /^09\d{8}$/.test(tel) ? '' : 'Revisa tu número: debe tener 10 dígitos, por ejemplo 09XXXXXXXX.'],
      [consentimiento, consentimiento.checked ? '' : 'Marca la casilla para que podamos responderte.'],
    ];
    errores.forEach(([campo, mensaje]) => marcarError(campo, mensaje));
    const primero = errores.find(([, mensaje]) => mensaje);
    if (primero) primero[0].focus();
    return !primero;
  };

  // Limpia el error de un campo en cuanto la persona lo corrige
  [nombre, telefono].forEach((campo) => campo.addEventListener('input', () => marcarError(campo, '')));
  consentimiento.addEventListener('change', () => marcarError(consentimiento, ''));

  const mostrarExito = (mensaje) => {
    exito.textContent = mensaje;
    exito.hidden = false;
  };

  const urlWhatsApp = (datos) => {
    const texto = `Hola PAMBI, soy ${datos.nombre}. Quiero ${datos.servicio.toLowerCase()} para mi ${datos.espacio.toLowerCase()}. Mi WhatsApp: ${datos.whatsapp}.`;
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    exito.hidden = true;
    if (!validar()) return;

    const datos = {
      nombre: nombre.value.trim(),
      whatsapp: telefono.value.replace(/\D/g, ''),
      espacio: espacio.value,
      servicio: servicio.value,
    };
    const primerNombre = datos.nombre.split(/\s+/)[0];

    if (!FORM_ENDPOINT) {
      window.open(urlWhatsApp(datos), '_blank', 'noopener');
      mostrarExito(`¡Listo, ${primerNombre}! Abrimos WhatsApp con tu solicitud escrita: solo presiona enviar y un asesor te responderá en minutos, en horario de atención.`);
      form.reset();
      return;
    }

    boton.disabled = true;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      mostrarExito(`¡Listo, ${primerNombre}! Recibimos tu solicitud. Un asesor te escribirá en minutos, en horario de atención.`);
      form.reset();
    } catch (err) {
      console.error('No se pudo enviar el formulario:', err);
      mostrarExito('No pudimos enviar tu solicitud. Te llevamos a WhatsApp para que nos escribas directo.');
      window.location.href = urlWhatsApp(datos);
    } finally {
      boton.disabled = false;
    }
  });

  /* Año del pie de página */
  document.querySelectorAll('[data-anio]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
