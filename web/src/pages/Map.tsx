import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPoint {
  id: string
  name: string
  description: string
  position: LatLngExpression
}

const Map: React.FC = () => {
  // Inami, Toyama Prefecture coordinates
  const center: LatLngExpression = [36.5569, 136.9628]
  const [points, setPoints] = useState<MapPoint[]>([])

  useEffect(() => {
    // Mock data for Inami points of interest
    const mockPoints: MapPoint[] = [
      {
        id: '1',
        name: 'Inami Woodcarving Center',
        description: 'Famous woodcarving workshop and gallery showcasing traditional crafts',
        position: [36.5569, 136.9628]
      },
      {
        id: '2', 
        name: 'Zuisenji Temple',
        description: 'Historic temple known for its beautiful woodcarvings',
        position: [36.5580, 136.9640]
      },
      {
        id: '3',
        name: 'Inami Traditional Craft Village',
        description: 'Experience traditional Japanese crafts and culture',
        position: [36.5550, 136.9610]
      }
    ]
    
    setPoints(mockPoints)
  }, [])

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '2rem', color: '#646cff' }}>
          Inami Interactive Map
        </h1>
        
        <div className="map-container" style={{ height: '600px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer 
            center={center} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {points.map((point) => (
              <Marker key={point.id} position={point.position}>
                <Popup>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', color: '#333' }}>{point.name}</h3>
                    <p style={{ margin: 0, color: '#666' }}>{point.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Points of Interest</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {points.map((point) => (
              <div 
                key={point.id}
                style={{ 
                  padding: '1rem', 
                  background: 'rgba(100, 108, 255, 0.1)', 
                  borderRadius: '8px',
                  textAlign: 'left'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', color: '#646cff' }}>{point.name}</h4>
                <p style={{ margin: 0 }}>{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Map