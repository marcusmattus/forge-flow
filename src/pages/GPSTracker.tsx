import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polyline } from '@react-google-maps/api';
import { Play, Square, MapPin, Zap, TrendingUp, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

export default function GPSTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([]);
  const [stats, setStats] = useState({
    distance: 0,
    pace: '0:00',
    elevation: 0,
    time: 0
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  useEffect(() => {
    let interval: any;
    if (isTracking) {
      interval = setInterval(() => {
        setStats(prev => ({ ...prev, time: prev.time + 1 }));
        
        // Mock GPS movement for demo if navigator.geolocation is unavailable or in iframe
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newPoint = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setPath(current => [...current, newPoint]);
          },
          (error) => {
            console.warn("Geolocation error:", error);
            // Fallback mock movement for demo
            setPath(current => {
              const last = current[current.length - 1] || { lat: 40.7128, lng: -74.0060 };
              return [...current, { lat: last.lat + 0.0001, lng: last.lng + 0.0001 }];
            });
          }
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">
            Field <span className="text-brand-pink">Operations</span>
          </h1>
          <p className="text-lg font-bold uppercase tracking-widest text-gray-500">GPS Tracking & Performance Metrics</p>
        </div>
        <button 
          onClick={() => setIsTracking(!isTracking)}
          className={isTracking ? "neo-button-pink" : "neo-button"}
        >
          {isTracking ? (
            <div className="flex items-center gap-2"><Square size={20} /> Stop Mission</div>
          ) : (
            <div className="flex items-center gap-2"><Play size={20} /> Start Mission</div>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-2 neo-container bg-gray-200 relative overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={path[path.length - 1] || { lat: 40.7128, lng: -74.0060 }}
              zoom={15}
              options={{
                styles: mapStyle,
                disableDefaultUI: true
              }}
            >
              <Polyline
                path={path}
                options={{
                  strokeColor: "#FF2E63",
                  strokeOpacity: 1,
                  strokeWeight: 6
                }}
              />
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-black uppercase tracking-widest">
              Loading Tactical Map...
            </div>
          )}
          
          {/* Map Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="neo-container bg-white px-3 py-1 text-xs font-black uppercase">
              Live Signal
            </div>
            <div className="neo-container bg-brand-yellow px-3 py-1 text-xs font-black uppercase">
              GPS Active
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="flex flex-col gap-6">
          <StatCard icon={<Navigation size={24} />} label="Distance" value={`${(path.length * 0.01).toFixed(2)}`} unit="Miles" />
          <StatCard icon={<Zap size={24} />} label="Pace" value={stats.pace} unit="/ Mile" />
          <StatCard icon={<TrendingUp size={24} />} label="Elevation" value={`${stats.elevation}`} unit="Feet" />
          <StatCard icon={<MapPin size={24} />} label="Time" value={formatTime(stats.time)} unit="Elapsed" />
          
          <div className="mt-auto neo-card bg-brand-black text-white p-6">
            <h3 className="text-lg font-black uppercase mb-2">Coach's Note</h3>
            <p className="text-sm font-bold italic opacity-80 leading-tight">
              "Your pace dropped at Mile 2. Don't let the fatigue win. Push through the wall."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit: string }) {
  return (
    <div className="neo-card flex items-center gap-4">
      <div className="p-3 bg-brand-yellow border-2 border-brand-black">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black italic tracking-tighter">{value}</span>
          <span className="text-xs font-bold uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );
}

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{ "color": "#eeeeee" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  }
];
