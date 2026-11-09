'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [commands, setCommands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCommands()
    const channel = supabase
      .channel('realtime_commands')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commands' }, () => {
        fetchCommands()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchCommands() {
    const { data } = await supabase.from('commands').select('*').order('created_at', { ascending: false }).limit(10)
    if (data) setCommands(data)
  }

  async function sendCommand(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    await supabase.from('commands').insert([{ prompt, status: 'pending' }])
    setPrompt('')
    setLoading(false)
    fetchCommands()
  }

  return (
    <main className="max-w-xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">🤖 My Remote AI Assistant</h1>
      
      <form onSubmit={sendCommand} className="flex gap-2 mb-6">
        <input 
          type="text" 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)} 
          placeholder="Apna command yahan likhein (jaise: dir, python script.py)..." 
          className="flex-1 border p-2 rounded-lg text-black"
        />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Activity Logs:</h2>
        {commands.map((cmd) => (
          <div key={cmd.id} className="border p-3 rounded-lg shadow-sm bg-white text-black">
            <p className="font-bold text-gray-800">Q: {cmd.prompt}</p>
            <p className="text-sm text-gray-500">Status: <span className={`font-semibold ${cmd.status === 'completed' ? 'text-green-600' : 'text-orange-500'}`}>{cmd.status}</span></p>
            {cmd.result && <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-x-auto text-black">{cmd.result}</pre>}
          </div>
        ))}
      </div>
    </main>
  )
}
