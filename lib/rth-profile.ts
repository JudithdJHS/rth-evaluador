export const RTH_PROFILE = {
  nombre: "Regálame tu Historia",
  fundadores: "Ana y Alex",
  voz: "Primera persona plural. Ana y Alex hablan como pareja real desde experiencia vivida. Tono cálido, cercano, con urgencia amorosa. Fe católica implícita, nunca predicadora. Nunca corporativo ni genérico.",
  mision: "Restauración matrimonial para parejas con crisis, distanciamiento, infidelidad o desgaste. Audiencia mayoritariamente femenina, 30-50 años, valores familiares o fe católica.",
  propuestaDeValor: "Ana y Alex pasaron por el infierno en su matrimonio y encontraron el camino de regreso. Enseñan desde la experiencia real, no desde la teoría. Su autoridad es la credibilidad de haberlo vivido.",
  escalera: [
    "Lead magnet gratuito (guías, webinars, contenido orgánico)",
    "Taller Del Infierno al Cielo en el Matrimonio (producto de entrada, precio accesible)",
    "Membresía recurrente",
    "Programa grupal de parejas — High Ticket (en desarrollo)",
    "Retiro de fin de semana — High Ticket (en desarrollo)"
  ],
  segmentos: [
    "Mujer en crisis aguda",
    "Hombre resistente al cambio",
    "Pareja en acuerdo de buscar ayuda",
    "Post-infidelidad",
    "Desgaste silencioso",
    "Fe + matrimonio",
    "Madre desesperada",
    "Crisis económica + matrimonial"
  ],
  ctas: ["TALLER", "REPARAR", "ENTRAR", "MATRIMONIO"],
  canales: {
    instagram: "~100K seguidores combinados",
    youtube: "~11K suscriptores"
  },
  objetivo: "Conversión a Taller como puerta de entrada. Nunca perder leads por fricciones técnicas. Mover emoción hacia acción concreta.",
  alertasCriticas: [
    "DMs a no seguidores van a 'Solicitudes de mensajes' — siempre instruir al usuario dónde buscar en la respuesta pública al comentario",
    "No publicar 2 piezas comerciales con mismo CTA en menos de 48h — genera fatiga y penalización algorítmica",
    "Miniaturas de Reels deben tener headline visible sin abrir el video",
    "Comentarios desde Facebook no activan automatización de Instagram — requieren seguimiento manual",
    "Reels de 30-60 segundos tienen mayor retención que los de 90+ segundos en esta audiencia",
    "El CTA 'link en bio' tiene bajo rendimiento — usar CTAs de comentario (TALLER, REPARAR) para activar ManyChat",
    "Contenido de conversión debe alternarse con contenido de valor puro cada 48h mínimo",
    "Stories con sticker de DM recuperan leads que comentaron pero no recibieron respuesta automática"
  ],
  matrizFunnel: {
    "Tope de funnel (descubrimiento)": {
      formatosIdeal: ["Reel viral con gancho emocional universal", "Carrusel educativo compartible", "Short YouTube"],
      caracteristicas: "Sin asumir contexto previo. Gancho en primeros 3 segundos. Altamente compartible. Sin CTA de venta directa.",
      ctaAdecuado: "Seguir, guardar, compartir — nunca comprar directamente",
      senalesDesalineacion: [
        "CTA de compra directa a audiencia fría",
        "Asume conocimiento previo de RTH o del Taller",
        "Lenguaje de cierre en pieza de captación"
      ]
    },
    "Medio funnel (consideración)": {
      formatosIdeal: ["Carrusel con testimonio + contexto", "Reel de historia real", "Video YouTube explicativo"],
      caracteristicas: "Ya conoce el problema. Busca prueba social y credibilidad. Compara opciones. Necesita profundidad.",
      ctaAdecuado: "Comentar palabra clave, ver más contenido, lead magnet gratuito",
      senalesDesalineacion: [
        "Pieza demasiado superficial para audiencia que ya considera",
        "Sin prueba social ni testimonio",
        "Sin profundidad emocional"
      ]
    },
    "Fondo de funnel (decisión / CTA)": {
      formatosIdeal: ["Story con urgencia y fecha límite", "Reel de cierre con CTA directo", "Email de conversión", "DM personalizado"],
      caracteristicas: "Ya confía. Necesita urgencia real, fricción mínima, beneficio concreto y fecha límite.",
      ctaAdecuado: "TALLER, REPARAR, ENTRAR — con fecha de cierre explícita",
      senalesDesalineacion: [
        "Sin fecha límite en pieza de cierre",
        "CTA ambiguo o 'link en bio'",
        "Pieza publicada a audiencia fría con CTA de compra"
      ]
    },
    "Post-compra (onboarding)": {
      formatosIdeal: ["Story de bienvenida", "Email de onboarding", "Mensaje de WhatsApp"],
      caracteristicas: "Ya compró. Necesita confirmación emocional de su decisión, claridad sobre próximos pasos y comunidad.",
      ctaAdecuado: "Ingresar a grupo, completar registro, primera acción concreta",
      senalesDesalineacion: [
        "Pieza de venta enviada a quien ya compró",
        "Sin instrucciones claras de siguiente paso"
      ]
    }
  }
}

export const PREGUNTAS_CONTEXTO = [
  {
    id: "objetivo",
    pregunta: "¿Cuál es el objetivo principal de esta pieza?",
    opciones: [
      "Captación (audiencia nueva)",
      "Conversión (llevar a comprar)",
      "Retención (fidelizar existentes)",
      "Recuperación (reactivar fríos)"
    ]
  },
  {
    id: "segmento",
    pregunta: "¿A qué segmento de RTH va dirigida principalmente?",
    opciones: [
      "Mujer en crisis aguda",
      "Hombre resistente al cambio",
      "Pareja en acuerdo de buscar ayuda",
      "Post-infidelidad",
      "Desgaste silencioso",
      "Audiencia general"
    ]
  },
  {
    id: "journey",
    pregunta: "¿En qué momento del customer journey estás ubicando esta pieza?",
    opciones: [
      "Tope de funnel (descubrimiento)",
      "Medio funnel (consideración)",
      "Fondo de funnel (decisión / CTA)",
      "Post-compra (onboarding)"
    ]
  },
  {
    id: "urgencia",
    pregunta: "¿Hay urgencia o fecha límite asociada a esta pieza?",
    opciones: [
      "Sí — cierre en menos de 72h",
      "Sí — cierre esta semana",
      "No hay urgencia definida"
    ]
  },
  {
    id: "producto",
    pregunta: "¿Qué producto de la Escalera de Valor promueve?",
    opciones: [
      "Taller Del Infierno al Cielo",
      "Membresía",
      "Contenido gratuito / lead magnet",
      "Awareness general sin CTA de producto"
    ]
  }
]
