import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  const { buildingId, buildingName } = await request.json()

  // 履歴を取得
  const { data: history, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('building_id', buildingId)
    .order('changed_at', { ascending: false })
    .limit(10)

  if (error || !history) {
    return NextResponse.json({ error: '履歴の取得に失敗しました' }, { status: 500 })
  }

  // 現在の状態を取得
  const { data: statuses } = await supabase
    .from('statuses')
    .select('*')
    .eq('building_id', buildingId)

  // プロンプト構築
  const historyText = history.map(h =>
    `[${h.changed_at}] ${h.category} / ${h.item}: ${h.status}${h.memo ? ` (${h.memo})` : ''}`
  ).join('\n')

  const currentText = statuses?.map(s =>
    `${s.category} / ${s.item}: ${s.status}`
  ).join('\n') ?? 'データなし'

  const prompt = `あなたはビル管理の専門家です。以下のビルの状態履歴と現在の状態をもとに、今後起こりうる事象を予測し、対応アドバイスを日本語で簡潔に提供してください。

【ビル名】${buildingName}

【現在の状態】
${currentText}

【過去の変化履歴（直近10件）】
${historyText}

予測と対応アドバイスを200字程度でまとめてください。`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const prediction = message.content[0].type === 'text' ? message.content[0].text : ''

  return NextResponse.json({ prediction })
}
