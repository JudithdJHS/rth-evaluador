import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Evaluador de Contenido — RTH',
  description: 'Análisis estratégico de piezas antes de publicar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
