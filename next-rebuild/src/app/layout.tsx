import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: '与AI共舞',
  description: '一场关于AI发展与未来的互动叙事演示',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
