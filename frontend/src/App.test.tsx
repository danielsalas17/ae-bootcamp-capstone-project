import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the landing heading and search action', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /letterboxd clone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search movies/i })).toBeInTheDocument()
  })
})
