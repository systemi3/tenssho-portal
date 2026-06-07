'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (body: string) => Promise<void>
}

export default function ReplyForm({ onSubmit }: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    await onSubmit(body.trim())
    setBody('')
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">返信する</h3>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder="返信内容を入力してください"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !body.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '送信中...' : '返信する'}
        </button>
      </div>
    </div>
  )
}
