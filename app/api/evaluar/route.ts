import { NextRequest, NextResponse } from 'next/server'
import { RTH_PROFILE } from '@/lib/rth-profile'

type Answer = { q: string; a: string }
type CompIG = { url: string; caption: string; result: string }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pieceText, channel, answers, competitorYT, competitorIG } = body

    if (!pieceText && !body.hasFile) {
      return NextResponse.json({ error: 'No se recibio contenido' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const ctx = answers ? answers.map((a: Answer) => a.q + ': ' + a.a).join('\n') : 'Sin contexto adicional'
    const ytList = competitorYT ? competitorYT.map((u: string) => 'YouTube: ' + u) : []
    const igList = competitorIG ? competitorIG.map((r: CompIG) => 'Instagram: ' + r.url + ' | ' + r.caption) : []
    const comp = [...ytList, ...igList].join('\n') || 'Sin referencias de competencia'
    const journeyDeclared = answers ? (answers.find((a: Answer) => a.q.includes('customer journey'))?.a || 'No especificado') : 'No especificado'

    const escalera = RTH_PROFILE.escalera.join(' -> ')
    const segmentos = RTH_PROFILE.segmentos.join(', ')
    const ctas = RTH_PROFILE.ctas.join(', ')
    const alertas = RTH_PROFILE.alertasCriticas.map((a: string, i: number) => (i + 1) + '. ' + a).join('\n')
    const matriz = Object.entries(RTH_PROFILE.matrizFunnel).map(([etapa, info]) => {
      return etapa + ': formatos=' + info.formatosIdeal.join(', ') + ' | CTA=' + info.ctaAdecuado
    }).join('\n')

    const jsonTemplate = '{"score":7,"verdict":"Viable con cambios","verdict_sub":"frase corta","funnel_alignment":{"declared":"declarado","actual":"real","aligned":false,"explanation":"explicacion","impact":"impacto"},"dimensions":[{"name":"Customer journey","score":7,"level":"med","note":"nota"},{"name":"Propuesta de valor","score":8,"level":"high","note":"nota"},{"name":"Fuerza del CTA","score":5,"level":"med","note":"nota"},{"name":"Tono y voz RTH","score":9,"level":"high","note":"nota"},{"name":"Mecanica de plataforma","score":6,"level":"med","note":"nota"},{"name":"Escalera de valor","score":7,"level":"high","note":"nota"},{"name":"Coherencia de funnel","score":4,"level":"low","note":"nota"}],"recommendations":[{"text":"recomendacion 1","priority":"critical"},{"text":"recomendacion 2","priority":"moderate"},{"text":"recomendacion 3","priority":"low"}],"improved_piece":"pieza mejorada o NA","competitor_ideas":"ideas o NA"}'

    const prompt = 'Eres el motor de analisis estrategico de contenido para Regalame tu Historia (RTH).\n\n'
      + 'VOZ: ' + RTH_PROFILE.voz + '\n'
      + 'MISION: ' + RTH_PROFILE.mision + '\n'
      + 'PROPUESTA DE VALOR: ' + RTH_PROFILE.propuestaDeValor + '\n'
      + 'ESCALERA: ' + escalera + '\n'
      + 'SEGMENTOS: ' + segmentos + '\n'
      + 'CTAS: ' + ctas + '\n'
      + 'OBJETIVO: ' + RTH_PROFILE.objetivo + '\n\n'
      + 'ALERTAS CRITICAS:\n' + alertas + '\n\n'
      + 'MATRIZ DE FUNNEL:\n' + matriz + '\n\n'
      + 'PIEZA A EVALUAR:\n'
      + 'Canal: ' + channel + '\n'
      + 'Contenido: ' + (pieceText || 'Archivo subido') + '\n\n'
      + 'CONTEXTO:\n' + ctx + '\n'
      + 'Funnel declarado: ' + journeyDeclared + '\n\n'
      + 'COMPETENCIA:\n' + comp + '\n\n'
      + 'INSTRUCCIONES:\n'
      + '1. Evalua con criterio de consultora senior en marketing digital e Instagram/YouTube.\n'
      + '2. Detecta desalineacion entre funnel declarado y construccion real de la pieza.\n'
      + '3. Aplica alertas criticas de RTH.\n'
      + '4. Se especifico, directo, accionable.\n\n'
      + 'Responde SOLO con JSON valido sin markdown ni backticks:\n'
      + jsonTemplate

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error('Anthropic error ' + response.status + ': ' + JSON.stringify(errData))
    }

    const data = await response.json()
    const raw = data.content
      ? data.content.filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('')
      : ''
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
