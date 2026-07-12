import { useState } from 'react'

export default function AddWebsiteForm({ onAdd }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !url.trim()) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    try {
      await onAdd({ name: name.trim(), url: url.trim() })
      setName('')
      setUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Add a website</h2>
      {error && <p className="form-error">{error}</p>}
      <div className="form-row">
        <input
          className="form-input"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <input
          className="form-input"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  )
}
