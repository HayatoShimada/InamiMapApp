import React from 'react'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem', color: '#646cff' }}>
          Welcome to InamiMapApp
        </h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Explore the beautiful Inami region with our interactive mapping application. 
          Discover local attractions, cultural sites, and hidden gems.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/map">
            <button style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              View Interactive Map
            </button>
          </Link>
          
          <button style={{ fontSize: '1.1rem', padding: '1rem 2rem', opacity: 0.6 }}>
            Download Mobile App (Coming Soon)
          </button>
        </div>
        
        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div style={{ padding: '2rem', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Interactive Maps</h3>
            <p>Explore detailed maps with points of interest, hiking trails, and local landmarks.</p>
          </div>
          
          <div style={{ padding: '2rem', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Cultural Heritage</h3>
            <p>Discover Inami's rich woodcarving tradition and historical sites.</p>
          </div>
          
          <div style={{ padding: '2rem', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Mobile Friendly</h3>
            <p>Access maps on the go with our responsive web app and upcoming mobile application.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home