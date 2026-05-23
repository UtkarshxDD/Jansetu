import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents, ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import exifr from 'exifr';
import { io } from 'socket.io-client';
import {
  AlertTriangle, X, MapPin, Trash2, Navigation,
  Flame, CloudRain, Wind, Thermometer, Send, Plus, Zap,
  Check, Activity, ChevronRight, ChevronLeft,
  Eye, EyeOff, Layers, RefreshCw, Info, Heart, Share2
} from 'lucide-react';
import { API } from '../ApiUri';
import { WEATHER_CONFIG, WEATHER_ICONS } from '../config/weather';

// ─── Fix Leaflet default icons ────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Issue {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  severity: number;
  category: string;
  status: 'pending' | 'under_review' | 'assigned' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  voteCount: number;
  averageRating: number;
  address: string;
  media: string[];
  createdAt: string;
  hasUpvoted?: boolean;
  upvotesCount?: number;
  locationVerified?: boolean;
}

interface Comment {
  _id: string;
  comment: string;
  userMade: { _id: string; name: string };
  createdAt: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  iconCode: string;
}

// ─── AI Category Suggestion ────────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Road': ['pothole', 'road', 'street', 'highway', 'traffic', 'pavement', 'crack', 'bump', 'tarmac', 'signal'],
  'Sanitation': ['garbage', 'waste', 'trash', 'dump', 'litter', 'dirty', 'clean', 'smell', 'odor', 'sewage', 'drain'],
  'Water Supply': ['water', 'pipe', 'leak', 'flood', 'drainage', 'waterlog', 'supply', 'tap', 'overflow'],
  'Electricity': ['light', 'electric', 'power', 'streetlight', 'wire', 'cable', 'outage', 'pole', 'dark'],
  'Infrastructure': ['wall', 'bridge', 'building', 'construction', 'damage', 'broken', 'collapse', 'fence', 'footpath'],
  'Environment': ['tree', 'plant', 'pollution', 'air', 'noise', 'park', 'green', 'garden', 'cutting'],
  'Public Safety': ['crime', 'theft', 'danger', 'unsafe', 'security', 'police', 'violence', 'accident'],
};

function suggestCategory(title: string, desc: string): string | null {
  const text = `${title} ${desc}`.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = kws.filter(kw => text.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = cat; }
  }
  return bestScore > 0 ? best : null;
}

// ─── Status / Priority configs ────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  pending:      { label: 'Pending',      color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: '#facc15' },
  under_review: { label: 'Under Review', color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: '#60a5fa' },
  assigned:     { label: 'Assigned',     color: 'bg-purple-50 text-purple-700 border-purple-200', dot: '#c084fc' },
  resolved:     { label: 'Resolved',     color: 'bg-green-50 text-green-700 border-green-200',    dot: '#4ade80' },
};

const SEVERITY_COLORS = ['', '#4ade80', '#fbbf24', '#f97316', '#ef4444', '#991b1b'];
const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600', medium: 'bg-orange-50 text-orange-600', high: 'bg-red-50 text-red-600'
};

// ─── Custom Leaflet marker icons ──────────────────────────────────────────────
function makeIcon(color: string, size = 24, hasImage = false, isVerified = false): L.DivIcon {
  let innerHtml = '';
  const iconSize = size * 0.55;
  
  if (isVerified) {
    innerHtml = `<div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>`;
  } else if (hasImage) {
    innerHtml = `<div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
      <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>`;
  }

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:50% 50% 50% 0;
      background:${color}; border:2.5px solid #ffffff;
      box-shadow:0 3px 6px rgba(0,0,0,0.15);
      transform:rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
    ">
      ${innerHtml}
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const USER_ICON = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#2563eb;border:3px solid #fff;
    box-shadow:0 0 0 4px rgba(37,99,235,0.2),0 2px 8px rgba(0,0,0,0.2);
    animation: pulse 2s infinite;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ─── Heatmap layer component ──────────────────────────────────────────────────
const HeatmapLayer: React.FC<{ issues: Issue[]; visible: boolean }> = ({ issues, visible }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    if (!visible || issues.length === 0) return;

    const points = issues.map(i => [i.lat, i.lng, i.severity / 5] as [number, number, number]);
    const heat = (L as any).heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.2: '#4ade80', 0.4: '#facc15', 0.6: '#f97316', 0.8: '#ef4444', 1.0: '#7f1d1d' },
      max: 1.0,
      minOpacity: 0.4,
    });
    heat.addTo(map);
    layerRef.current = heat;
    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [map, issues, visible]);

  return null;
};

// ─── Clustered markers component ──────────────────────────────────────────────
interface ClusterMarkersProps {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
  selectedId: string | null;
}

const ClusterMarkers: React.FC<ClusterMarkersProps> = ({ issues, onSelect, selectedId }) => {
  const map = useMap();
  const groupRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (groupRef.current) {
      map.removeLayer(groupRef.current);
    }

    const group = (L as any).markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        const size = count < 10 ? 36 : count < 50 ? 42 : 50;
        const bg = count < 10 ? '#3b82f6' : count < 50 ? '#f97316' : '#ef4444';
        return L.divIcon({
          className: '',
          html: `<div style="
            width:${size}px;height:${size}px;border-radius:50%;
            background:${bg};color:#fff;font-weight:700;font-size:14px;
            display:flex;align-items:center;justify-content:center;
            border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.15);
            font-family:Inter,sans-serif;
          ">${count}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    issues.forEach(issue => {
      const color = SEVERITY_COLORS[Math.round(issue.severity)] || '#94a3b8';
      const isSelected = issue.id === selectedId;
      const hasImage = issue.media && issue.media.length > 0;
      const isVerified = issue.locationVerified || false;
      const icon = makeIcon(color, isSelected ? 32 : 24, hasImage, isVerified);

      const tooltipContent = `
        <div style="font-family: Inter, sans-serif; min-width: 120px;">
          <strong style="display: block; font-size: 14px; margin-bottom: 4px; color: #1f2937;">${issue.title}</strong>
          <div style="font-size: 12px; color: #4b5563; margin-bottom: 2px;">
            <span style="font-weight: 600;">Category:</span> ${issue.category}
          </div>
          <div style="font-size: 12px; color: #4b5563;">
            <span style="font-weight: 600;">Status:</span> <span style="text-transform: capitalize;">${issue.status.replace('_', ' ')}</span>
          </div>
        </div>
      `;

      const marker = L.marker([issue.lat, issue.lng], { icon })
        .on('click', () => onSelect(issue))
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -20],
          opacity: 0.95,
          className: 'shadow-lg rounded-lg border-0'
        });

      group.addLayer(marker);
    });

    group.addTo(map);
    groupRef.current = group;

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current);
    };
  }, [map, issues, onSelect, selectedId]);

  return null;
};

// ─── Map click / location handler ────────────────────────────────────────────
interface MapInteractionProps {
  onMapClick: (lat: number, lng: number) => void;
  onLocationUpdate: (lat: number, lng: number) => void;
}

const MapInteraction: React.FC<MapInteractionProps> = ({ onMapClick, onLocationUpdate }) => {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.locate({ watch: false, enableHighAccuracy: true });
    const onLocationFound = (e: L.LocationEvent) => {
      onLocationUpdate(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, 14, { duration: 1.5 });
    };
    
    map.on('locationfound', onLocationFound);
    return () => {
      map.off('locationfound', onLocationFound);
    };
  }, [map, onLocationUpdate]);

  return null;
};

// ─── Severity picker ──────────────────────────────────────────────────────────
const SeverityPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="w-10 h-10 rounded-xl font-bold text-sm transition-all border-2 focus:outline-none"
        style={n <= value
          ? { background: SEVERITY_COLORS[n], borderColor: SEVERITY_COLORS[n], color: '#fff', transform: 'scale(1.05)' }
          : { background: '#f8fafc', borderColor: '#e2e8f0', color: '#94a3b8' }
        }
      >{n}</button>
    ))}
    <span className="text-xs text-slate-500 ml-2 font-medium">
      {value <= 2 ? 'Minor' : value === 3 ? 'Moderate' : value === 4 ? 'Serious' : '🔴 Critical'}
    </span>
  </div>
);

// ─── Weather widget ───────────────────────────────────────────────────────────
const WeatherWidget: React.FC<{ data: WeatherData | null }> = ({ data }) => {
  if (!data) return null;
  const icon = (WEATHER_ICONS as any)[data.iconCode] || '🌡️';
  return (
    <div className="absolute top-4 right-4 z-[999] bg-white/90 backdrop-blur text-slate-800 rounded-2xl p-3.5 shadow-xl border border-slate-100 text-xs min-w-[150px] pointer-events-none">
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-3xl drop-shadow-sm">{icon}</span>
        <div>
          <p className="font-bold text-xl leading-none text-slate-800">{data.temperature}°C</p>
          <p className="text-slate-500 font-medium text-[11px] mt-0.5">{data.condition}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-slate-600 font-medium bg-slate-50 rounded-lg p-2 border border-slate-100">
        <div className="flex flex-col items-center"><CloudRain className="w-3.5 h-3.5 text-blue-400 mb-0.5" />{data.precipitation}mm</div>
        <div className="flex flex-col items-center"><Wind className="w-3.5 h-3.5 text-sky-400 mb-0.5" />{data.windSpeed}m/s</div>
        <div className="flex flex-col items-center"><Thermometer className="w-3.5 h-3.5 text-rose-400 mb-0.5" />{data.humidity}%</div>
      </div>
    </div>
  );
};

// ─── Main MapPage ─────────────────────────────────────────────────────────────
const MapPage: React.FC = () => {
  const [userPos, setUserPos] = useState<[number, number]>([27.5684, 78.6501]); // Default: Etah, UP
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  // UI toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRadius, setShowRadius] = useState(false);
  const [radiusKm, setRadiusKm] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters & sort
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'severity' | 'votes' | 'recent'>('severity');

  // Create form
  const [clickedPos, setClickedPos] = useState<[number, number] | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formSeverity, setFormSeverity] = useState(3);
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formMedia, setFormMedia] = useState<File[]>([]);
  const [similarIssues, setSimilarIssues] = useState<any[]>([]);
  const [suggestedCat, setSuggestedCat] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // Weather
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const currentUserId = localStorage.getItem('id');

  // ── Fetch issues ────────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: '300' };
      if (showRadius) {
        params.lat = String(userPos[0]);
        params.lng = String(userPos[1]);
        params.radiusKm = String(radiusKm);
      }
      
      let mapped: Issue[] = [];
      try {
        const res = await axios.get(`${API}/getAllproblems`, { params });
        mapped = (res.data.problems || []).map((p: any) => ({
          id: p._id,
          lat: p.location?.coordinates?.[1] ?? 0,
          lng: p.location?.coordinates?.[0] ?? 0,
          title: p.title || 'Untitled',
          description: p.description || '',
          severity: p.averageRating || 1,
          category: p.category || 'General',
          status: p.status || 'pending',
          priority: p.priority || 'medium',
          createdBy: p.createdBy,
          voteCount: p.voteCount || 0,
          averageRating: p.averageRating || 0,
          address: p.address || '',
          media: p.media || [],
          createdAt: p.createdAt || '',
          upvotesCount: p.upvotedBy ? p.upvotedBy.length : 0,
          hasUpvoted: p.upvotedBy ? p.upvotedBy.includes(currentUserId) : false,
          locationVerified: p.locationVerified || false,
        }));
      } catch (err) {
        console.error('API failed', err);
        toast.error('Failed to load issues');
      }

      setIssues(mapped);
    } catch (err) {
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [showRadius, userPos, radiusKm]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  // ── Fetch weather ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showWeather || !WEATHER_CONFIG.API_KEY || WEATHER_CONFIG.API_KEY === 'demo_key') return;
    fetch(`${WEATHER_CONFIG.BASE_URL}/weather?lat=${userPos[0]}&lon=${userPos[1]}&appid=${WEATHER_CONFIG.API_KEY}&units=metric`)
      .then(r => r.json())
      .then(d => setWeather({
        temperature: Math.round(d.main?.temp ?? 0),
        humidity: d.main?.humidity ?? 0,
        windSpeed: Math.round(d.wind?.speed ?? 0),
        precipitation: d.rain?.['1h'] ?? 0,
        condition: d.weather?.[0]?.main ?? '',
        iconCode: d.weather?.[0]?.icon ?? '',
      }))
      .catch(() => {});
  }, [userPos, showWeather]);

  // ── AI category suggestion ──────────────────────────────────────────────────
  useEffect(() => {
    const s = suggestCategory(formTitle, formDesc);
    setSuggestedCat(s);
  }, [formTitle, formDesc]);

  // ── Similar issues check ────────────────────────────────────────────────────
  useEffect(() => {
    if (!clickedPos || formTitle.length < 4) { setSimilarIssues([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/similar`, { params: { lat: clickedPos[0], lng: clickedPos[1], text: formTitle } });
        if (res.data.success) setSimilarIssues(res.data.similar || []);
      } catch { setSimilarIssues([]); }
    }, 500);
    return () => clearTimeout(t);
  }, [clickedPos, formTitle]);

  // ── Fetch comments when issue selected ─────────────────────────────────────
  useEffect(() => {
    if (!selectedIssue) { setComments([]); return; }
    setLoadingComments(true);
    axios.get(`${API}/getComment/${selectedIssue.id}`)
      .then(r => { if (r.data.success) setComments(r.data.comments || []); })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [selectedIssue]);

  // ── Real-Time Status Updates (WebSockets) ──────────────────────────────────
  useEffect(() => {
    const socket = io(API.replace('/api/v1/users', ''));
    
    socket.on('status_updated', (data) => {
      setIssues(prev => prev.map(issue => 
        issue.id === data.issueId ? { ...issue, status: data.status } : issue
      ));
      setSelectedIssue(prev => prev?.id === data.issueId ? { ...prev, status: data.status } : prev);
      
      const statusLabel = data.status.replace('_', ' ').toUpperCase();
      toast(`An issue status was just updated to ${statusLabel}!`, { 
        icon: '🔄',
        style: { background: '#f8fafc', color: '#0f172a', fontWeight: 'bold' }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Map click ───────────────────────────────────────────────────────────────
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!localStorage.getItem('token')) {
      toast.error('Please log in to report an issue');
      return;
    }
    setClickedPos([lat, lng]);
    setShowCreateModal(true);
    setSimilarIssues([]);
  }, []);

  // ── Submit new issue ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formDesc.trim() || !clickedPos) { toast.error('Please add a description'); return; }
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!userId || !token) { toast.error('Please log in'); return; }

    setSubmitting(true);
    const form = new FormData();
    form.append('title', formTitle || 'Untitled Issue');
    form.append('description', formDesc);
    form.append('category', formCategory || 'General');
    form.append('coordinates', JSON.stringify([clickedPos[1], clickedPos[0]]));
    form.append('rating', String(formSeverity));
    form.append('priority', formPriority);

    const compressionOptions = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    
    let exifLat: number | null = null;
    let exifLng: number | null = null;

    for (const f of formMedia.slice(0, 4)) {
      try {
        if (exifLat === null) {
          const gps = await exifr.gps(f);
          if (gps) {
            exifLat = gps.latitude;
            exifLng = gps.longitude;
          }
        }
        const compressedFile = await imageCompression(f, compressionOptions);
        form.append('media', compressedFile, compressedFile.name);
      } catch (error) {
        console.error("Compression/EXIF error:", error);
        form.append('media', f); // fallback to original
      }
    }

    if (exifLat !== null && exifLng !== null) {
      form.append('exifLat', String(exifLat));
      form.append('exifLng', String(exifLng));
    }

    try {
      const res = await axios.post(`${API}/createProblem/${userId}`, form, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const p = res.data.problem;
      const newIssue: Issue = {
        id: p._id,
        lat: p.location.coordinates[1],
        lng: p.location.coordinates[0],
        title: p.title,
        description: p.description,
        severity: p.averageRating || formSeverity,
        category: p.category,
        status: p.status,
        priority: p.priority,
        createdBy: p.createdBy,
        voteCount: 0,
        averageRating: p.averageRating || 0,
        address: p.address || '',
        media: p.media || [],
        createdAt: p.createdAt || new Date().toISOString(),
      };
      setIssues(prev => [newIssue, ...prev]);
      toast.success('🎉 Issue reported successfully!');
      // Reset form
      setShowCreateModal(false);
      setFormTitle(''); setFormDesc(''); setFormCategory('');
      setFormSeverity(3); setFormPriority('medium');
      setFormMedia([]); setClickedPos(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Duplicate Issue Detected! Please upvote this existing issue instead.", { duration: 5000 });
        setShowCreateModal(false);
        const dupId = err.response.data.duplicateId;
        const dupIssue = issues.find(i => i.id === dupId);
        if (dupIssue) {
          onSelect(dupIssue);
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to create issue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rate issue ──────────────────────────────────────────────────────────────
  const handleRate = async (issueId: string, rating: number) => {
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!userId || !token) { toast.error('Please log in'); return; }
    try {
      await axios.post(`${API}/problems/${issueId}/rate/${userId}`, { rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(prev => prev.map(i =>
        i.id === issueId ? { ...i, voteCount: i.voteCount + (rating >= 3 ? 1 : 0), averageRating: rating } : i
      ));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, voteCount: prev.voteCount + (rating >= 3 ? 1 : 0), averageRating: rating } : null);
      }
      toast.success('Rating submitted!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not rate');
    }
  };

  // ── Upvote issue ────────────────────────────────────────────────────────────
  const handleUpvote = async (issueId: string) => {
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!userId || !token) { toast.error('Please log in'); return; }
    try {
      const res = await axios.post(`${API}/problems/${issueId}/upvote/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { hasUpvoted, upvotesCount } = res.data;
      
      setIssues(prev => prev.map(i =>
        i.id === issueId ? { ...i, hasUpvoted, upvotesCount } : i
      ));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(prev => prev ? { ...prev, hasUpvoted, upvotesCount } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not upvote');
    }
  };

  // ── Add comment ─────────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!userId || !token) { toast.error('Please log in'); return; }
    try {
      const res = await axios.post(
        `${API}/addComment/${selectedIssue.id}/${userId}`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [...prev, res.data.comment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
  };

  // ── Delete issue ────────────────────────────────────────────────────────────
  const handleDelete = async (issueId: string) => {
    const userId = localStorage.getItem('id');
    const token = localStorage.getItem('token');
    if (!userId || !token) return;
    if (!window.confirm('Delete this report?')) return;
    try {
      await axios.delete(`${API}/problem/${issueId}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIssues(prev => prev.filter(i => i.id !== issueId));
      setSelectedIssue(null);
      toast.success('Issue deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not delete');
    }
  };

  // ── SOS ─────────────────────────────────────────────────────────────────────
  const handleSOS = () => {
    if (!localStorage.getItem('token')) { toast.error('Please log in first'); return; }
    setClickedPos(userPos);
    setFormPriority('high');
    setFormCategory('Public Safety');
    setFormTitle('🆘 Emergency Report');
    setFormSeverity(5);
    setShowCreateModal(true);
    toast('🆘 Emergency numbers: 100 Police · 101 Fire · 108 Ambulance', {
      duration: 7000,
      style: { background: '#dc2626', color: '#fff', fontWeight: '600' }
    });
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const categories = useMemo(() =>
    Array.from(new Set(issues.map(i => i.category))).sort(),
    [issues]
  );

  const filteredIssues = useMemo(() =>
    issues
      .filter(i => !filterCategory || i.category === filterCategory)
      .filter(i => !filterStatus || i.status === filterStatus)
      .sort((a, b) => {
        if (sortBy === 'severity') return b.severity - a.severity;
        if (sortBy === 'votes') return b.voteCount - a.voteCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [issues, filterCategory, filterStatus, sortBy]
  );

  const stats = useMemo(() => ({
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  }), [issues]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#faf9f5] overflow-hidden relative">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[340px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)]"
          >
            {/* Sidebar header */}
            <div className="p-5 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-slate-900 font-black text-xl tracking-tight">Civic Map 🗺️</h1>
                  <p className="text-slate-500 text-xs font-medium">{filteredIssues.length} issues visible</p>
                </div>
                {/* SOS */}
                <button
                  onClick={handleSOS}
                  className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" /> SOS
                </button>
              </div>

              {/* Stats pills */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { label: 'Total', val: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-100' },
                  { label: 'Pending', val: stats.pending, color: 'bg-amber-50 text-amber-700 border-amber-100' },
                  { label: 'Resolved', val: stats.resolved, color: 'bg-green-50 text-green-700 border-green-100' },
                ].map(s => (
                  <div key={s.label} className={`flex-shrink-0 text-center px-3 py-1.5 rounded-full border text-xs font-bold ${s.color}`}>
                    <span className="text-sm">{s.val}</span> <span className="font-medium opacity-80">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="space-y-2.5">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-50 text-slate-700 text-sm font-medium rounded-xl px-3 py-2.5 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="flex-1 bg-slate-50 text-slate-700 text-xs font-medium rounded-xl px-3 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="flex-1 bg-slate-50 text-slate-700 text-xs font-medium rounded-xl px-3 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="severity">Highest Severity</option>
                    <option value="votes">Most Votes</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>

                {/* Radius toggle */}
                <button
                  onClick={() => setShowRadius(!showRadius)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                    showRadius
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2"><Navigation className="w-4 h-4" /> Near Me Filter</span>
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${showRadius ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${showRadius ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>

                {showRadius && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between text-xs text-slate-600 mb-2 font-semibold">
                      <span>Search Radius</span>
                      <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">{radiusKm} km</span>
                    </div>
                    <input
                      type="range" min={1} max={50} value={radiusKm}
                      onChange={e => setRadiusKm(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                    />
                    <button
                      onClick={fetchIssues}
                      className="mt-3 w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <RefreshCw className="w-3 h-3" /> Apply Filter
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Issue list */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
                  <p className="text-slate-500 text-sm font-medium">Loading issues...</p>
                </div>
              ) : filteredIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 gap-3 bg-white rounded-2xl border border-slate-100 border-dashed m-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <p className="text-slate-700 text-sm font-bold text-center">No issues found here.</p>
                  <p className="text-slate-500 text-xs text-center font-medium">Click anywhere on the map<br/>to report something new!</p>
                </div>
              ) : (
                filteredIssues.map(issue => {
                  const isSelected = selectedIssue?.id === issue.id;
                  const sc = STATUS_CONFIG[issue.status] || STATUS_CONFIG.pending;
                  return (
                    <button
                      key={issue.id}
                      onClick={() => {
                        setSelectedIssue(issue);
                        mapRef.current?.flyTo([issue.lat, issue.lng], 16, { duration: 1 });
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-white border-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Severity icon */}
                        <div
                          className="w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center text-white font-bold text-xs shadow-inner"
                          style={{ backgroundColor: SEVERITY_COLORS[Math.round(issue.severity)] || '#94a3b8' }}
                        >
                          {issue.severity.toFixed(1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 text-sm font-bold truncate">{issue.title}</p>
                          <p className="text-slate-500 text-xs truncate mt-0.5 font-medium">
                            {issue.category} {issue.address ? `· ${issue.address.split(',')[0]}` : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${sc.color}`}>
                              {sc.label}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${PRIORITY_BADGE[issue.priority]}`}>
                              {issue.priority}
                            </span>
                            <span className="text-slate-500 font-bold text-[10px] flex items-center gap-0.5 ml-auto bg-slate-100 px-1.5 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-amber-500" /> {issue.voteCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Click hint */}
            <div className="p-3 bg-blue-50 text-blue-700">
              <p className="text-[11px] font-semibold text-center flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Tap anywhere on the map to drop a pin
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Map container ────────────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-[#e2e8f0]">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[1000] bg-white text-slate-700 p-2 rounded-r-xl shadow-lg border border-l-0 border-slate-200 hover:bg-slate-50 transition-colors"
        >
          {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Map layer controls */}
        <div className="absolute top-4 left-6 z-[999] flex flex-col gap-2">
          {[
            { label: 'Heatmap', Icon: Flame, active: showHeatmap, toggle: () => setShowHeatmap(!showHeatmap), activeColor: 'bg-rose-500 border-rose-500 text-white shadow-rose-500/30' },
            { label: 'Clusters', Icon: Layers, active: showClusters, toggle: () => setShowClusters(!showClusters), activeColor: 'bg-blue-600 border-blue-600 text-white shadow-blue-600/30' },
            { label: 'Weather', Icon: CloudRain, active: showWeather, toggle: () => setShowWeather(!showWeather), activeColor: 'bg-sky-500 border-sky-500 text-white shadow-sky-500/30' },
          ].map(({ label, Icon, active, toggle, activeColor }) => (
            <button
              key={label}
              onClick={toggle}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border shadow-md flex items-center gap-2 transition-all ${
                active ? activeColor : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active ? <Eye className="w-3.5 h-3.5 opacity-70 ml-1" /> : <EyeOff className="w-3.5 h-3.5 opacity-40 ml-1 text-slate-400" />}
            </button>
          ))}
        </div>

        {/* Weather widget (top right of map) */}
        {showWeather && <WeatherWidget data={weather} />}

        {/* Stats bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className="bg-white/90 backdrop-blur text-slate-800 rounded-2xl px-6 py-3 text-sm font-semibold flex items-center gap-6 border border-slate-200 shadow-xl">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <strong className="text-blue-600">{stats.total}</strong> Total
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm" />
              <strong className="text-amber-600">{stats.pending}</strong> Pending
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block shadow-sm" />
              <strong className="text-green-600">{stats.resolved}</strong> Resolved
            </span>
          </div>
        </div>

        {/* The Leaflet Map */}
        <MapContainer
          center={userPos}
          zoom={13}
          className="w-full h-full"
          zoomControl={false}
          ref={mapRef as any}
        >
          <ZoomControl position="bottomright" />

          {/* Beautiful Light Theme CartoDB Positron */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {/* Map interaction (click + geolocation) */}
          <MapInteraction
            onMapClick={handleMapClick}
            onLocationUpdate={useCallback((lat: number, lng: number) => setUserPos([lat, lng]), [])}
          />

          {/* User position */}
          <Marker position={userPos} icon={USER_ICON}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-bold text-sm text-slate-800">📍 You are here</p>
              </div>
            </Popup>
          </Marker>

          {/* Radius circle */}
          {showRadius && (
            <Circle
              center={userPos}
              radius={radiusKm * 1000}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 2, dashArray: '6 4' }}
            />
          )}

          {/* Heatmap */}
          <HeatmapLayer issues={filteredIssues} visible={showHeatmap} />

          {/* Clustered markers */}
          {showClusters && (
            <ClusterMarkers
              issues={filteredIssues}
              onSelect={setSelectedIssue}
              selectedId={selectedIssue?.id ?? null}
            />
          )}
        </MapContainer>
      </div>

      {/* ── Issue Detail Panel (right slide-in) ─────────────────────────────── */}
      <AnimatePresence>
        {selectedIssue && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[400px] flex-shrink-0 bg-white flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-200 z-20 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    const text = `Help fix this issue: "${selectedIssue.title}" in our city! Upvote it on JanSetu: ${window.location.origin}/map`;
                    if (navigator.share) {
                      navigator.share({ title: 'JanSetu Issue', text, url: window.location.origin + '/map' }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(text);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                  className="p-2 bg-white hover:bg-blue-50 rounded-full transition-colors shadow-sm border border-slate-200"
                  title="Share this issue"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 bg-white hover:bg-slate-100 rounded-full transition-colors shadow-sm border border-slate-200"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              
              <div className="pr-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-md border font-bold flex-shrink-0 ${STATUS_CONFIG[selectedIssue.status]?.color}`}>
                    {STATUS_CONFIG[selectedIssue.status]?.label}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-md font-bold flex-shrink-0 border ${PRIORITY_BADGE[selectedIssue.priority]}`}>
                    {selectedIssue.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <h2 className="font-black text-slate-900 text-xl leading-tight mb-2">{selectedIssue.title}</h2>
                {selectedIssue.address && (
                  <p className="text-slate-500 text-xs font-medium flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-blue-500" />
                    {selectedIssue.address}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Description */}
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedIssue.description}</p>
              </div>

              {/* Stats row */}
              <div className="p-5 border-b border-slate-100 grid grid-cols-3 gap-4 bg-slate-50/50">
                <button 
                  onClick={() => handleUpvote(selectedIssue.id)}
                  className={`p-3 rounded-xl border shadow-sm text-center transition-all hover:scale-105 active:scale-95 ${
                    selectedIssue.hasUpvoted 
                      ? 'bg-rose-50 border-rose-200 ring-1 ring-rose-500 shadow-rose-500/20' 
                      : 'bg-white border-slate-100 hover:border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <p className={`text-2xl font-black flex items-center justify-center gap-1.5 ${selectedIssue.hasUpvoted ? 'text-rose-600' : 'text-slate-600'}`}>
                    <Heart className={`w-5 h-5 ${selectedIssue.hasUpvoted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    {selectedIssue.upvotesCount || 0}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${selectedIssue.hasUpvoted ? 'text-rose-500' : 'text-slate-400'}`}>
                    {selectedIssue.hasUpvoted ? 'Upvoted' : 'Upvote'}
                  </p>
                </button>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center">
                  <p className="text-2xl font-black text-amber-500">{selectedIssue.averageRating.toFixed(1)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Rating</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col justify-center">
                  <p className="text-sm font-black text-slate-700 truncate">{selectedIssue.category}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Category</p>
                </div>
              </div>

              {/* Severity bar */}
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Severity Level</span>
                  <span className="text-sm font-black" style={{ color: SEVERITY_COLORS[Math.round(selectedIssue.severity)] }}>
                    {selectedIssue.severity.toFixed(1)} <span className="text-slate-400 text-xs">/ 5</span>
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 relative"
                    style={{
                      width: `${(selectedIssue.severity / 5) * 100}%`,
                      background: `linear-gradient(to right, #4ade80, ${SEVERITY_COLORS[Math.round(selectedIssue.severity)]})`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Rate this issue's severity:</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => handleRate(selectedIssue.id, n)}
                      className="flex-1 py-2 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                      style={{ background: SEVERITY_COLORS[n] }}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* Media */}
              {selectedIssue.media?.length > 0 && (
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Photos</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {selectedIssue.media.map((url, i) => {
                      const fullUrl = url.startsWith('http') ? url : `${API.replace('/api/v1/users', '')}${url}`;
                      return (
                        <div key={i} className="relative flex-shrink-0 group">
                          <img
                            src={fullUrl}
                            alt={`media ${i + 1}`}
                            className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 shadow-sm"
                            onClick={() => window.open(fullUrl, '_blank')}
                          />
                          {selectedIssue.locationVerified && i === 0 && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              VERIFIED
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Comments
                  </p>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md">{comments.length}</span>
                </div>
                
                {loadingComments ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center mb-4">
                    <p className="text-slate-400 text-sm font-medium">No comments yet.</p>
                    <p className="text-slate-500 text-xs mt-1">Be the first to add one!</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    {comments.map(c => (
                      <div key={c._id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
                        <p className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                          <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px]">
                            {c.userMade?.name?.charAt(0) || 'A'}
                          </span>
                          {c.userMade?.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-slate-600 pl-6.5">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 text-sm border-2 border-slate-200 rounded-xl px-4 py-2.5 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className={`p-3 rounded-xl transition-all ${
                      newComment.trim() 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Delete */}
            {selectedIssue.createdBy === currentUserId && (
              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => handleDelete(selectedIssue.id)}
                  className="w-full text-red-600 text-sm font-bold flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors border border-transparent"
                >
                  <Trash2 className="w-4 h-4" /> Delete My Report
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create Issue Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
            onClick={e => {
              if (e.target === e.currentTarget) {
                setShowCreateModal(false);
                setClickedPos(null);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-slate-100"
            >
              {/* Modal header */}
              <div className="bg-white border-b border-slate-100 p-6 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900 text-2xl">Report Issue</h2>
                  {clickedPos && (
                    <p className="text-slate-500 font-medium text-xs mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      {clickedPos[0].toFixed(5)}, {clickedPos[1].toFixed(5)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); setClickedPos(null); }}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors border border-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-slate-50/30">
                {/* Similar issues warning */}
                {similarIssues.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
                  >
                    <p className="text-amber-800 text-sm font-black mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Similar issues nearby:
                    </p>
                    {similarIssues.slice(0, 2).map((s: any) => (
                      <p key={s._id} className="text-amber-700 text-sm font-medium mb-1">• {s.title}</p>
                    ))}
                    <p className="text-amber-600 text-xs mt-2 font-bold uppercase tracking-wider">Consider voting on these instead!</p>
                  </motion.div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Issue Title *</label>
                  <input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="e.g. Large pothole near bus stop"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all bg-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Description *</label>
                  <textarea
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium resize-none transition-all bg-white"
                  />
                </div>

                {/* Category + AI suggestion */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                  <AnimatePresence>
                    {suggestedCat && !formCategory && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => setFormCategory(suggestedCat)}
                        type="button"
                        className="mb-2 text-sm font-bold bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors w-full shadow-sm"
                      >
                        <span className="text-lg">🤖</span>
                        <span>AI suggests: {suggestedCat}</span>
                        <span className="ml-auto flex items-center gap-1 text-xs uppercase tracking-wider text-blue-600"><Check className="w-3.5 h-3.5" /> Apply</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium bg-white transition-all"
                  >
                    <option value="">Select category</option>
                    {Object.keys(CATEGORY_KEYWORDS).map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="General">General / Other</option>
                    <option value="Public Safety">Public Safety</option>
                    <option value="Emergency">Emergency 🆘</option>
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Severity Level</label>
                  <SeverityPicker value={formSeverity} onChange={setFormSeverity} />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Priority</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormPriority(p)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-black border-2 transition-all ${
                          formPriority === p
                            ? p === 'high' ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                              : p === 'medium' ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20'
                              : 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 bg-white'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media upload */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Photos <span className="font-medium text-slate-400 ml-1">(Optional, max 4)</span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-slate-300 bg-white rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-700">
                      {formMedia.length > 0 ? `${formMedia.length} file(s) selected` : 'Tap to select photos'}
                    </span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={e => setFormMedia(Array.from(e.target.files || []).slice(0, 4))}
                    />
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="p-6 border-t border-slate-100 bg-white flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formDesc.trim() || !formTitle.trim()}
                  className={`w-full py-4 rounded-xl font-black text-white text-sm transition-all flex items-center justify-center gap-2 ${
                    submitting || !formDesc.trim() || !formTitle.trim()
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>🚩 SUBMIT REPORT</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;