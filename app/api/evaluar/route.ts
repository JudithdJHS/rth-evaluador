import { NextRequest, NextResponse } from 'next/server'
import { RTH_PROFILE } from '@/lib/rth-profile'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pieceText, channel, answers, competitorYT, competitorIG } = body

    if (!pieceText && !body.hasFile) {
      return NextResponse.json({ error: 'No se recibió contenido de la pieza' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const ctx = answers?.map((a) => `${a.q}: ${a.a}`).join('\n') || 'Sin contexto adicional'
    const comp = [
      ...(competitorYT || []).map((u) => `YouTube: ${u}`),
      ...(competitorIG || []).map((r) => `Instagram: ${r.url} | Caption: ${r.caption} | Resultado: ${r.result}`)
    ].join('\n') || 'Sin referencias de competencia'

    const journeyDeclared = answers?.find((a) => a.q.includes('customer journey'))?.a || 'No especificado'

    const matrizTexto = Object.entries(RTH_PROFILE.matrizFunnel)
      .map(([etapa, info]) =>
        `${etapa}:\n  Formatos ideales: ${info.formatosIdeal.join(', ')}\n  Características: ${info.caracteristicas}\n  CTA adecuado: ${info.ctaAdecuado}\n  Señales de desalineación: ${info.senalesDesalineacion.join(', ')}`)
      .join('\n\n')

    const prompt = `Eres el motor de análisis estratégico de contenido para Regálame tu Historia (RTH), marca de restauración matrimonial católica liderada por Ana y Alex.

PERFIL RTH:
Voz: ${RTH_PROFILE.voz}
Propuesta de valor: ${RTH_PROFILE.propuestaDeValor}
Misión: ${RTH_PROFILE.mision}
Escalera de valor: ${RTH_PROFILE.escalera.join(' → ')}
Segmentos: ${RTH_PROFILE.segmentos.join(', ')}
CTAs activos: ${RTH_PROFILE.ctas.join(', ')}
Objetivo central: ${RTH_PROFILE.objetivo}

ALERTAS CRÍTICAS DEL ECOSISTEMA RTH:
${RTH_PROFILE.alertasCriticas.map((a, i) => `${i + 1}. ${a}`).join('\n')}

MATRIZ DE COHERENCIA DE FUNNEL:
${matrizTexto}

PIEZA A EVALUAR:
Canal: ${channel}
Contenido: ${pieceText || '[Archivo subido — evalúa por tipo de formato y canal]'}

CONTEXTO ESTRATÉGICO:
${ctx}
Momento de funnel declarado: ${journeyDeclared}

REFERENCIAS DE COMPETENCIA:
${comp}

INSTRUCCIONES:
1. Evalúa con criterio de consultora estratégica senior en marketing digital, algoritmos de Instagram y YouTube.
2. Detecta desalineación entre funnel declarado y construcción real de la pieza.
3. Aplica alertas críticas del ecosistema RTH.
4. Sé específico, directo, accionable. Nada genérico.

Responde ÚNICAMENTE con JSON válido, sin markdown, sin backticks:

{"score":7,"verdict":"Viable con cambios","verdict_sub":"Frase de máx 12 palabras","funnel_alignment":{"declared":"Tope de funnel (descubrimiento)","actual":"Fondo de funnel (decisión / CTA)","aligned":false,"explanation":"Explicación en máx 2 oraciones","impact":"Impacto en rendimiento"},"dimensions":[{"name":"Customer journey","score":7,"level":"med","note":"Máx 6 palabras"},{"name":"Propuesta de valor","score":8,"level":"high","note":"Máx 6 palabras"},{"name":"Fuerza del CTA","score":5,"level":"med","note":"Máx 6 palabras"},{"name":"Tono y voz RTH","score":9,"level":"high","note":"Máx 6 palabras"},{"name":"Mecánica de plataforma","score":6,"level":"med","note":"Máx 6 palabras"},{"name":"Escalera de valor","score":7,"level":"high","note":"Máx 6 palabras"},{"name":"Coherencia de funnel","score":4,"level":"low","note":"Máx 6 palabras"}],"recommendations":[{"text":"Recomendación concreta accionable","priority":"critical"},{"text":"Segunda recomendación","priority":"moderate"},{"text":"Tercera recomendación","priority":"low"}],"improved_piece":"Versión mejorada respetando voz de Ana y Alex. Si no hay texto suficiente escribe NA","competitor_ideas":"Ideas de competencia aplicables a RTH. Si no hay referencias escribe NA"}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error ${response.status}: ${JSON.stringify(errData)}`)
    }

    const data = await response.json()
    const raw = data.content?.filter((b) => b.type === 'text').map((b) => b.text).join('') || ''
    const clean = raw.replace(/```json|```/g, '').trim()

    let report
    try {
      report = JSON.parse(clean)
    } catch {
      const match = clean.match(/\{[\s\S]*\}/)
      if (match) report = JSON.parse(match[0])
      else throw new Error('No se pudo parsear la respuesta')
    }

    return NextResponse.json(report)

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
