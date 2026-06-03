import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import type { Status, StatusHistory } from '@/types'

export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const { buildingId, buildingName } = await request.json()

  // 履歴を取得
  const { data: historyData, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('building_id', buildingId)
    .order('changed_at', { ascending: false })
    .limit(20)

  if (error || !historyData) {
    return NextResponse.json({ error: '履歴の取得に失敗しました' }, { status: 500 })
  }

  const history = historyData as StatusHistory[]

  // 現在の状態を取得
  const { data: statusesData } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', buildingId)

  const statuses = statusesData as Status[] | null

  // プロンプト構築
  const historyText = history.length > 0
    ? history.map(h =>
        `[${h.changed_at}] ${h.category} / ${h.item}: ${h.status}${h.memo ? ` (${h.memo})` : ''}`
      ).join('\n')
    : '（履歴なし）'

  const currentText = statuses && statuses.length > 0
    ? statuses.map(s => `${s.category} / ${s.item}: ${s.status}`).join('\n')
    : '（データなし）'

  const prompt = `あなたはビル管理の専門家です。以下のビルの情報をもとに分析してください。

【ビル名】${buildingName}

【現在の状態】
${currentText}

【過去の変化履歴（直近20件）】
${historyText}

以下の3項目を日本語で回答してください。

## 予測される事象
現在の状態と履歴のパターンから、近い将来に起こりうる問題や注意点を具体的に記述してください。

## 推奨アクション
今すぐ・または近日中に取るべき対応を箇条書きで記述してください。

## 緊急度
「高・中・低」のいずれかで判定し、その理由を一文で記述してください。`

  // ストリーミングで返す
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
