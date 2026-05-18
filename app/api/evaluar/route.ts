import { NextRequest, NextResponse } from 'next/server'
import { RTH_PROFILE } from '@/lib/rth-profile'

type Answer = { q: string; a: string }
type CompIG = { url: string; caption: string; result: string }

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

    const ctx = answers?.map((a: Answer) => `${a.q}: ${a.a}`).join('\n') || 'Sin contexto adicional'
    const comp = [
      ...(competitorYT || []).map((u: string) => `YouTube: ${u}`),
      ...(competitorIG || []).map((r: CompIG) => `Instagram: ${r.url} | Caption: ${r.caption} | Resultado: ${r.result}`)
    ].join('\n') || 'Sin referencias de competencia'

    const journeyDeclared = answers?.find((a: Answer) => a.q.includes('customer journey'))?.a || 'No especificado'

    const matrizTexto = Object.entries(RTH_PROFILE.matrizFunnel)
      .map(([etapa, info]) =>
        `${etapa}:\n  Formatos ideales: ${info.formatosIdeal.join(', ')}\n  Características: ${info.caracteristicas}\n  CTA adecuado: ${info.ctaAdecuado}\n  Señales de desalineación: ${info.senalesDesalineacion.join(', ')}`)
      .join('\n\n')

    c
