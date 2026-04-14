import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerScrape } from '../api/client'

export function ScrapeButton() {
  const [showToast, setShowToast] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const queryClient = useQueryClient()

  const scrapeMutation = useMutation({
    mutationFn: triggerScrape,
    onSuccess: () => {
      setToastType('success')
      setShowToast(true)
      queryClient.invalidateQueries({ queryKey: ['articles'] })
      setTimeout(() => setShowToast(false), 3000)
    },
    onError: () => {
      setToastType('error')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    },
  })

  return (
    <div className="relative">
      <button
        onClick={() => scrapeMutation.mutate()}
        disabled={scrapeMutation.isPending}
        className="bg-yellow-400 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-black uppercase text-sm hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_black]"
      >
        {scrapeMutation.isPending ? 'Scraping...' : 'Scrape'}
      </button>
      {showToast && (
        <div className={`absolute top-full mt-2 left-0 border-3 border-black shadow-[4px_4px_0_black] px-4 py-2 font-bold text-sm ${toastType === 'success' ? 'bg-green-400' : 'bg-red-400'}`}>
          {toastType === 'success' ? 'Scrape complete!' : 'Scrape failed'}
        </div>
      )}
    </div>
  )
}