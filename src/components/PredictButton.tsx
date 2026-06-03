'use client'

import { useState } from 'react'

type Props = {
  buildingId: string
  buildingName: string
}

export default function PredictButton({ buildingId, buildingName }: Props) {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    setPrediction(null)

    let res: Response
    try {
      res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingId, buildingName }),
      })
    } catch {
      setError('ネットワークエラーが発生しました')
      setLoading(false)
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? '予測に失敗しました')
      setLoading(false)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      setError('ストリームの取得に失敗しました')
      setLoading(false)
      return
    }

    const decoder = new TextDecoder()
    setLoading(false)
    setPrediction('')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      setPrediction((prev) => (prev ?? '') + decoder.decode(value, { stream: true }))
    }
  }

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-700">LLM予測エージェント</h2>
          <p className="text-xs text-gray-400 mt-0.5">過去の履歴をもとにClaudeが次の事象を予測します</p>
        </div>
        <button
          onClick={handlePredict}
          disabled={loading || prediction !== null}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {loading ? '分析中...' : prediction !== null ? '予測済み' : '予測を見る'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {prediction !== null && (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{prediction}</p>
          {prediction === '' && (
            <span className="inline-block w-1.5 h-4 bg-blue-400 animate-pulse ml-0.5" />
          )}
        </div>
      )}
      {prediction !== null && (
        <button
          onClick={() => { setPrediction(null); setError(null) }}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          閉じる
        </button>
      )}
    </div>
  )
}
