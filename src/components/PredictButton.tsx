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

    const res = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buildingId, buildingName }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setError(data.error)
      return
    }
    setPrediction(data.prediction)
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
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium
                     hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {loading ? '予測中...' : '予測を見る'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {prediction && (
        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{prediction}</p>
        </div>
      )}
    </div>
  )
}
