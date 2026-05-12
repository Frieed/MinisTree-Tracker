import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, List, Map as MapIcon, MapPinOff, Loader2, Sprout, Mars, Venus, CalendarDays, Droplets } from 'lucide-react';
import L from 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useVisits } from '../hooks/useVisits';
import { seedlingIcon, maturePlantIcon, dropletIcon } from '../components/map/MapIcons';
import { AddVisitModal } from '../components/map/AddVisitModal';
import { VisitDetailsModal } from '../components/map/VisitDetailsModal';
import { WateringModal } from '../components/map/WateringModal';
import { DeleteConfirmationModal } from '../components/map/DeleteConfirmationModal';
import { useUI } from '../context/UIContext';

interface Visit {
    id: string;
    name: string;
    gender: 'Male' | 'Female';
    is_bible_study: boolean;
    latitude: number;
    longitude: number;
    address?: string;
    remarks?: string;
    availability_day?: string;
}

// Fix for leaflet default icon issue in React
let DefaultIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
// Map Event Handlers
const MapEvents = ({ onPositionSelect }: { onPositionSelect: (pos: [number, number]) => void }) => {
    useMapEvents({
        click: (e) => onPositionSelect([e.latlng.lat, e.latlng.lng]),
    });
    return null;
};

L.Marker.prototype.options.icon = DefaultIcon;

const VisitsMap = () => {
    const { setIsModalOpen: setGlobalModalOpen } = useUI();
    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' });
    const {
        visits, loading, visitLogs, loadingLogs, fetchVisitLogs,
        saveVisit, deleteVisit, waterVisit, toggleBibleStudy, deleteLog
    } = useVisits();

    const [showAdd, setShowAdd] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [map, setMap] = useState<L.Map | null>(null);
    const [editingVisit, setEditingVisit] = useState<any | null>(null);
    const [pendingVisit, setPendingVisit] = useState<any | null>(null);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

    // Form State
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [newPosition, setNewPosition] = useState<[number, number] | null>(null);
    const [newDay, setNewDay] = useState<string>('');
    const [newTime, setNewTime] = useState<string>('');
    const [newGender, setNewGender] = useState<string>('');
    const [lastVisited, setLastVisited] = useState<string>(new Date().toISOString().split('T')[0]);

    const [waterGiven, setWaterGiven] = useState<string>('');
    const [waterQuestions, setWaterQuestions] = useState<string>('');
    const [waterNotes, setWaterNotes] = useState<string>('');

    const [initialLiterature, setInitialLiterature] = useState<string>('');
    const [initialQuestions, setInitialQuestions] = useState<string>('');
    const [initialNotes, setInitialNotes] = useState<string>('');

    const [showWater, setShowWater] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [typeFilter, setTypeFilter] = useState<string>('All');
    const [genderFilter, setGenderFilter] = useState<string>('All');
    const [formStep, setFormStep] = useState(0);
    const [noLocationVisit, setNoLocationVisit] = useState<Visit | null>(null);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [openFilterId, setOpenFilterId] = useState<string | null>(null);

    useEffect(() => {
        if (showAdd || showWater || showDetails || noLocationVisit || showDeleteConfirm) {
            setGlobalModalOpen(true);
            return () => setGlobalModalOpen(false);
        }
    }, [showAdd, showWater, showDetails, noLocationVisit, showDeleteConfirm, setGlobalModalOpen]);

    useEffect(() => {
        if (editingVisit) {
            setNewName(editingVisit.name); setNewAddress(editingVisit.address || ''); 
            setNewDay(editingVisit.availability_day || ''); setNewTime(editingVisit.availability_time || '');
            setNewGender(editingVisit.gender || ''); 
            setNewPosition([editingVisit.latitude, editingVisit.longitude]);
        } else {
            setNewName(''); setNewAddress(''); setNewDay(''); setNewTime('');
            setNewGender(''); setNewPosition(null);
            setInitialLiterature(''); setInitialQuestions(''); setInitialNotes('');
        }
    }, [editingVisit]);

    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
            (error) => console.error(error), { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        if (activeTab === 'map' && map) {
            setTimeout(() => {
                map.invalidateSize();
                if (visits.length === 0 && userPosition) map.setView(userPosition, 13);
            }, 400);
        }
    }, [activeTab, map, visits.length, userPosition]);

    useEffect(() => {
        if (activeTab === 'map' && map && pendingVisit) {
            map.flyTo([pendingVisit.latitude, pendingVisit.longitude], 18, { duration: 1.5 });
            setPendingVisit(null);
        }
    }, [activeTab, map, pendingVisit]);

    const handleSaveVisitLocal = async () => {
        if (!newName) return;
        setSaving(true);
        const result = await saveVisit({
            name: newName, address: newAddress, availability_day: newDay,
            availability_time: newTime, gender: newGender, 
            latitude: newPosition ? newPosition[0] : 0,
            longitude: newPosition ? newPosition[1] : 0
        }, editingVisit?.id) as any;

        const { data, error } = result;

        if (!error && !editingVisit?.id) {
            // If it's a new visit, create the initial log
            const visitId = (data as any)?.id;
            if (visitId && (initialLiterature || initialQuestions || initialNotes)) {
                await waterVisit(visitId, {
                    visit_date: new Date().toISOString().split('T')[0],
                    literature: initialLiterature,
                    questions: initialQuestions,
                    notes: initialNotes
                }, {
                    literature_given: initialLiterature,
                    rv_questions: initialQuestions
                });
            }
        }

        if (!error) { setShowAdd(false); setEditingVisit(null); }
        setSaving(false);
    };

    const handleWaterVisitLocal = async () => {
        if (!editingVisit) return;
        setSaving(true);
        const { error } = await waterVisit(editingVisit.id, {
            visit_date: lastVisited, literature: waterGiven, questions: waterQuestions, notes: waterNotes
        }, { literature_given: waterGiven, rv_questions: waterQuestions });
        if (!error) {
            setShowWater(false);
            setShowDetails(true);
            setWaterGiven('');
            setWaterQuestions('');
            setWaterNotes('');
        }
        setSaving(false);
    };

    const filteredVisits = useMemo(() => {
        return visits.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.address?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDay = activeFilter === 'All' ||
                (activeFilter === 'Flexible' && !v.availability_day) ||
                (v.availability_day && v.availability_day.split(',').some((d: string) => {
                    const trimmedDay = d.trim();
                    if (activeFilter === 'Flexible') {
                        return trimmedDay === 'Flexible' || trimmedDay.toLowerCase() === 'anyday';
                    }
                    return trimmedDay === activeFilter;
                }));
            const matchesType = typeFilter === 'All' || (typeFilter === 'bible_study' && v.is_bible_study) || (typeFilter === 'return_visit' && !v.is_bible_study);
            const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
            return matchesSearch && matchesDay && matchesType && matchesGender;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [visits, searchQuery, activeFilter, typeFilter, genderFilter]);

    const LocationPicker = () => {
        useMapEvents({ click(e) { setNewPosition([e.latlng.lat, e.latlng.lng]); } });
        return null;
    };

    return (
        <div className="flex flex-col relative bg-nature-cream min-h-full pb-20">
            <div className="px-6 pb-4 z-50 space-y-4 pt-6">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-nature-brown-dark tracking-tight flex items-center gap-1.5">
                            Your <span className="text-nature-green">Garden</span>
                        </h2>
                        <p className="text-nature-brown font-medium mt-0.5">
                            Sprinkle your seedlings and nurture your trees by visiting them regularly.
                        </p>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end gap-2">
                        <div className="bg-nature-green/10 px-3 py-2 rounded-xl flex items-center gap-1.5 text-nature-green-dark shrink-0">
                            <CalendarDays size={14} />
                            <span className="font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                                {monthName.substring(0, 3)} {today.getFullYear()}
                            </span>
                        </div>
                        {filteredVisits.length !== visits.length && (
                            <span className="text-[10px] font-black text-nature-green uppercase tracking-widest mt-1">
                                {filteredVisits.length} found
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex relative bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-nature-cream shadow-sm">
                    {['list', 'map'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as 'list' | 'map')} className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors z-10 ${activeTab === tab ? 'text-white' : 'text-nature-brown-light'}`}>
                            {activeTab === tab && <motion.div layoutId="active-tab-bg" className="absolute inset-0 bg-nature-green rounded-xl shadow-md -z-10" />}
                            {tab === 'list' ? <List size={14} /> : <MapIcon size={14} />}
                            {tab === 'list' ? 'Lists' : 'Map'}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <div className="relative group flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-brown-light" size={18} />
                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-nature-cream-light rounded-2xl py-4 pl-12 pr-4 shadow-soft outline-none font-medium text-sm" />
                    </div>
                    <button onClick={() => { setEditingVisit(null); setFormStep(0); setShowAdd(true); setActiveTab('map'); }} className="min-w-[64px] px-2 h-[58px] bg-nature-green text-white rounded-2xl shadow-lg flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0">
                        <Sprout size={20} className="mb-0.5" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Add/Plant</span>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 relative">
                    {[
                        { val: activeFilter, set: setActiveFilter, options: ['All', ...days, 'Flexible'], label: 'Schedule', id: 'schedule' },
                        { val: typeFilter, set: setTypeFilter, options: ['All', 'return_visit', 'bible_study'], label: 'Categories', id: 'type' },
                        { val: genderFilter, set: setGenderFilter, options: ['All', 'Male', 'Female'], label: 'Gender', id: 'gender' }
                    ].map((f, i) => {
                        const isOpen = openFilterId === f.id;
                        return (
                            <div key={i} className="relative">
                                <button 
                                    onClick={() => setOpenFilterId(isOpen ? null : f.id)}
                                    className={`w-full h-[42px] bg-white border-2 rounded-2xl flex items-center justify-between px-3 shadow-sm transition-all ${
                                        isOpen ? 'border-nature-green ring-2 ring-nature-green/10' : 'border-nature-cream'
                                    }`}
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${
                                        f.val !== 'All' ? 'text-nature-green' : 'text-nature-brown-light'
                                    }`}>
                                        {f.val === 'All' ? f.label : f.val.replace('_', ' ')}
                                    </span>
                                    <motion.div 
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        className="w-4 h-4 rounded-full bg-nature-cream/50 flex items-center justify-center shrink-0 ml-1"
                                    >
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-nature-brown-light"><path d="m6 9 6 6 6-6" /></svg>
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[1001]" onClick={() => setOpenFilterId(null)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border-2 border-nature-cream rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] py-2 z-[1002] max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar"
                                            >
                                                {f.options.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => {
                                                            f.set(opt);
                                                            setOpenFilterId(null);
                                                        }}
                                                        className={`w-full text-left px-4 py-2 text-xs font-bold transition-all flex items-center justify-between ${
                                                            f.val === opt 
                                                                ? 'text-nature-green bg-nature-green/5' 
                                                                : 'text-nature-brown-light hover:bg-nature-cream/30 hover:text-nature-brown-dark'
                                                        }`}
                                                    >
                                                        <span className="truncate uppercase tracking-wider">{opt.replace('_', ' ')}</span>
                                                        {f.val === opt && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-nature-green" />
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={`relative mx-4 mb-24 rounded-3xl overflow-hidden bg-nature-cream/20 border border-nature-cream/40 shadow-inner flex flex-col transition-all duration-300 ${activeTab === 'map' ? 'h-[550px]' : 'h-[400px]'}`}>
                <AnimatePresence>
                    {activeTab === 'list' ? (
                        <motion.div key="list-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full overflow-y-auto p-4 space-y-3">
                            {filteredVisits.length > 0 ? filteredVisits.map((visit) => (
                                <motion.div 
                                    key={visit.id} 
                                    onClick={() => { setEditingVisit(visit); fetchVisitLogs(visit.id); setShowDetails(true); }} 
                                    className={`relative px-4 h-[92px] rounded-[2rem] border border-[#d1e2e2] shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transition-all overflow-hidden group bg-white hover:border-nature-green/30 flex items-center`}
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        {/* Readable Micro Type Tags - Shorthand BS/RV */}
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-inner ${
                                                visit.is_bible_study 
                                                    ? 'bg-[#e8f5f1] border-[#c2e5db]' 
                                                    : 'bg-[#ebf3fe] border-[#d4e4f9]'
                                            }`}>
                                                <span className={`${visit.is_bible_study ? 'text-3xl' : 'text-2xl'} filter drop-shadow-sm`}>
                                                    {visit.is_bible_study ? '🌳' : '🌱'}
                                                </span>
                                            </div>
                                            <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full border shadow-sm ${
                                                visit.is_bible_study 
                                                    ? 'bg-[#e8f5f1] border-[#c2e5db] text-[#4a9d80]' 
                                                    : 'bg-[#ebf3fe] border-[#d4e4f9] text-[#5c8ed1]'
                                            }`}>
                                                <span className="text-[7px] font-black uppercase tracking-widest leading-none block">{visit.is_bible_study ? 'BS' : 'RV'}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-[17px] font-black text-[#8b5e3c] tracking-tight truncate leading-tight">{visit.name}</h3>
                                                {visit.gender === 'Male' ? (
                                                    <Mars size={16} className="text-[#5c8ed1]" strokeWidth={3} />
                                                ) : visit.gender === 'Female' ? (
                                                    <Venus size={16} className="text-[#E91E63]" strokeWidth={3} />
                                                ) : null}
                                            </div>
                                            <div className="flex items-start gap-1.5">
                                                <MapPin size={10} className="text-[#b4c7c7] mt-1 shrink-0" />
                                                <div className="space-y-0.5">
                                                    <p className="text-[11px] text-[#8b8b8b] font-medium leading-tight line-clamp-2 italic">{visit.address || 'No address'}</p>
                                                    <p className="text-[9px] text-[#b4c7c7] font-bold leading-tight line-clamp-1">{visit.notes?.substring(0, 40) || 'No recent notes'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Combined Action Pill */}
                                        <div className="flex items-center bg-[#f8fbfb] border border-[#e8f2f2] rounded-full overflow-hidden shadow-sm h-12 shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingVisit(visit); setWaterGiven(''); setWaterQuestions(''); setWaterNotes(''); setShowWater(true); }}
                                                className="px-4 h-full flex items-center justify-center text-[#5c8ed1] bg-[#ebf3fe]/40 hover:bg-[#ebf3fe] transition-colors"
                                            >
                                                <Droplets size={24} />
                                            </button>
                                            <div className="w-[1.5px] h-7 bg-[#d1e2e2]" />
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (visit.latitude === 0 && visit.longitude === 0) {
                                                        setNoLocationVisit(visit);
                                                        return;
                                                    }
                                                    setPendingVisit(visit); 
                                                    setActiveTab('map'); 
                                                }} 
                                                className="px-4 h-full flex items-center justify-center text-[#8b7e6a] hover:bg-white transition-colors"
                                            >
                                                <MapPin size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6"><div className="w-24 h-24 bg-nature-cream rounded-3xl flex items-center justify-center">{loading ? <Loader2 size={48} className="animate-spin text-nature-green/50" /> : <MapPinOff size={48} />}</div><h3 className="text-xl font-black text-nature-brown-dark uppercase tracking-wider">{loading ? "Gathering Seedlings..." : "No Visits Found"}</h3></div>}
                        </motion.div>
                    ) : (
                        <div key="map-view" className="h-full w-full relative">
                            <MapContainer 
                                center={userPosition || [14.5995, 120.9842]} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }} 
                                ref={setMap} 
                                zoomControl={false}
                                preferCanvas={true}
                            >
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
                                <MapEvents onPositionSelect={() => {}} />
                                {filteredVisits.map((visit) => (
                                    <Marker 
                                        key={visit.id} 
                                        position={[visit.latitude, visit.longitude]} 
                                        icon={visit.is_bible_study ? maturePlantIcon : seedlingIcon}
                                        eventHandlers={{ click: () => { setEditingVisit(visit); fetchVisitLogs(visit.id); setShowDetails(true); } }}
                                    />
                                ))}
                                {showAdd && <LocationPicker />}
                                {(showAdd && newPosition) && <Marker position={newPosition} icon={seedlingIcon} />}
                                {userPosition && <Marker position={userPosition} icon={dropletIcon} />}
                            </MapContainer>
                            <button onClick={() => userPosition && map?.flyTo(userPosition, 18)} className="absolute top-6 right-6 z-[1000] w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-nature-green border-2 border-nature-cream hover:scale-105 active:scale-95 transition-all"><Navigation size={20} /></button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
            


            <AddVisitModal
                isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingVisit(null); }} step={formStep} setStep={setFormStep} editing={!!editingVisit}
                name={newName} setName={setNewName} address={newAddress} setAddress={setNewAddress} gender={newGender} setGender={setNewGender}
                day={newDay} setDay={setNewDay} time={newTime} setTime={setNewTime}
                literature={initialLiterature} setLiterature={setInitialLiterature}
                questions={initialQuestions} setQuestions={setInitialQuestions}
                notes={initialNotes} setNotes={setInitialNotes}
                position={newPosition}
                setPosition={setNewPosition} userPosition={userPosition}
                onSave={handleSaveVisitLocal} saving={saving}
            />

            <VisitDetailsModal
                isOpen={showDetails} onClose={() => setShowDetails(false)} visit={editingVisit} logs={visitLogs} loadingLogs={loadingLogs}
                onEdit={() => { setShowDetails(false); setFormStep(0); setShowAdd(true); setActiveTab('map'); }}
                onDelete={() => setShowDeleteConfirm(true)}
                onWater={() => { setShowDetails(false); setWaterGiven(''); setWaterQuestions(''); setWaterNotes(''); setShowWater(true); }}
                onToggleStudy={async () => {
                    const res = await toggleBibleStudy(editingVisit.id, editingVisit.is_bible_study);
                    if (!res.error) setEditingVisit({ ...editingVisit, is_bible_study: !editingVisit.is_bible_study });
                }}
                onDeleteLog={(logId) => deleteLog(logId, editingVisit.id)}
            />

            <WateringModal
                isOpen={showWater} onClose={() => setShowWater(false)} visitName={editingVisit?.name}
                lastVisited={lastVisited} setLastVisited={setLastVisited} newGiven={waterGiven} setNewGiven={setWaterGiven}
                newQuestions={waterQuestions} setNewQuestions={setWaterQuestions} newNotes={waterNotes} setNewNotes={setWaterNotes}
                onSave={handleWaterVisitLocal} saving={saving}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    if (editingVisit) {
                        await deleteVisit(editingVisit.id);
                        setShowDeleteConfirm(false);
                        setShowDetails(false);
                    }
                }}
                itemName={editingVisit?.name || ''}
                itemType={editingVisit?.is_bible_study ? 'Bible Study' : 'Return Visit'}
            />

            <AnimatePresence>
                {noLocationVisit && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNoLocationVisit(null)} className="absolute inset-0 bg-nature-brown-dark/20 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-nature-cream text-center space-y-6">
                            <div className="w-20 h-20 bg-nature-cream rounded-[2rem] flex items-center justify-center mx-auto text-nature-brown-light">
                                <MapPinOff size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-nature-brown-dark uppercase tracking-tight">Location Not Set</h3>
                                <p className="text-nature-brown text-sm font-medium leading-relaxed px-2">
                                    No location has been pinpointed for <span className="font-black text-nature-green">{noLocationVisit.name}</span>. You can add coordinates by updating this visit's information.
                                </p>
                            </div>
                            <button onClick={() => setNoLocationVisit(null)} className="w-full h-14 bg-nature-green text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-nature-green/20 hover:scale-[1.02] active:scale-95 transition-all">Understood</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisitsMap;
