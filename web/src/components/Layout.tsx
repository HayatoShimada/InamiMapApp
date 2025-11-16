import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        background: '#1a1a1a', 
        color: 'white', 
        padding: '1rem 0',
        borderBottom: '1px solid #333'
      }}>
        <div className="container">
          <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
              InamiMapApp
            </Link>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link 
                to="/" 
                style={{ 
                  textDecoration: 'none',
                  color: location.pathname === '/' ? '#646cff' : 'inherit'
                }}
              >
                Home
              </Link>
              <Link 
                to="/map" 
                style={{ 
                  textDecoration: 'none',
                  color: location.pathname === '/map' ? '#646cff' : 'inherit'
                }}
              >
                Map
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      <footer style={{ 
        background: '#1a1a1a', 
        color: 'white', 
        padding: '1rem 0',
        marginTop: 'auto'
      }}>
        <div className="container">
          <p style={{ margin: 0, textAlign: 'center' }}>
            © 2024 InamiMapApp. Built with React & Express.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout