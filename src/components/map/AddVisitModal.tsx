import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Calendar, Clock, FileText, Loader2, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { seedlingIcon } from './MapIcons';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

interface AddVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    step: number;
    setStep: (s: number) => void;
    editing: boolean;
    name: string;
    setName: (n: string) => void;
    address: string;
    setAddress: (a: string) => void;
    gender: string;
    setGender: (g: string) => void;
    day: string;
    setDay: (d: string) => void;
    time: string;
    setTime: (t: string) => void;
    notes: string;
    setNotes: (n: string) => void;
    position: [number, number] | null;
    setPosition: (p: [number, number]) => void;
    userPosition: [number, number] | null;
    onSave: () => void;
    saving: boolean;
}

const ModalMap = ({ position, setPosition }: { position: [number, number] | null, setPosition: (p: [number, number]) => void }) => {
    const map = useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    useEffect(() => {
        if (map) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [map]);

    return (
        <div className="h-full w-full">
            <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                subdomains="abcd"
                maxZoom={18}
                keepBuffer={8}
                updateWhenIdle={true}
            />
            {position && <Marker position={position} icon={seedlingIcon} />}
        </div>
    );
};

export const AddVisitModal = ({
    isOpen, onClose, step, setStep, editing,
    name, setName, address, setAddress, gender, setGender,
    day, setDay, time, setTime, notes, setNotes, position, setPosition, userPosition,
    onSave, saving
}: AddVisitModalProps) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[1000] bg-nature-brown-dark/40 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] px-6 pt-4 pb-8 z-[1100] shadow-2xl max-h-[95vh] overflow-y-auto"
                >
                    <div className="w-12 h-1.5 bg-nature-cream rounded-full mx-auto mb-6" />

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-nature-brown-dark tracking-tight">{editing ? 'Edit' : 'New'} <span className="text-nature-green">Return Visit</span></h3>
                            <p className="text-[10px] uppercase font-bold text-nature-brown-light tracking-widest mt-1">Step {step + 1} of 3</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-nature-cream hover:bg-nature-brown/10 rounded-full text-nature-brown transition-colors"><X size={20} /></button>
                    </div>

                    <div className="space-y-6">
                        {step === 0 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><User size={12} /> Full Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-nature-green transition-all" placeholder="Enter name..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2">Gender</label>
                                    <div className="flex gap-2">
                                        {['Male', 'Female'].map(g => (
                                            <button key={g} onClick={() => setGender(g)} className={`flex-1 py-3 rounded-2xl font-bold transition-all border-2 ${gender === g ? 'bg-nature-green text-white border-nature-green' : 'bg-nature-cream/50 text-nature-brown-light border-nature-cream'}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><FileText size={12} /> Remarks / Initial Notes</label>
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-nature-green transition-all h-24" placeholder="What did you talk about?" />
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!name || !gender}
                                    className={`w-full h-16 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl font-black uppercase tracking-widest text-sm transition-all ${(!name || !gender) ? 'bg-nature-cream text-nature-brown-light opacity-50 cursor-not-allowed' : 'bg-nature-green text-white shadow-nature-green/20 hover:scale-[1.02] active:scale-95'}`}
                                >
                                    Next: Set Location <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><MapPin size={12} /> Pinpoint Location</label>
                                    <div className="h-64 rounded-3xl overflow-hidden border-2 border-nature-cream relative shadow-inner z-0">
                                        <MapContainer
                                            center={position || userPosition || [14.5995, 120.9842]}
                                            zoom={18}
                                            maxZoom={18}
                                            minZoom={3}
                                            zoomControl={false}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <ModalMap position={position} setPosition={setPosition} />
                                        </MapContainer>
                                        {!position && (
                                            <div className="absolute inset-0 bg-nature-brown-dark/5 pointer-events-none flex items-center justify-center">
                                                <div className="bg-white/90 px-4 py-2 rounded-full text-[10px] font-bold text-nature-brown uppercase tracking-widest shadow-sm flex items-center gap-2">
                                                    <MapPin size={12} className="text-rose-500 animate-bounce" /> Tap map to pinpoint
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${position ? 'bg-nature-green/5 border-nature-green/20' : 'bg-rose-50 border-rose-100 shadow-inner'}`}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <MapPin className={`shrink-0 ${position ? 'text-nature-green' : 'text-rose-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-nature-brown-dark truncate">{position ? 'Location pinpointed' : 'Location not set yet'}</p>
                                            {position && <p className="text-[10px] font-mono text-nature-green/80 mt-0.5 tracking-wider truncate">{position[0].toFixed(6)}, {position[1].toFixed(6)}</p>}
                                        </div>
                                    </div>
                                    {position && <CheckCircle2 className="text-nature-green shrink-0 ml-2" size={18} />}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><MapPin size={12} /> Address Name / Description</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-nature-green transition-all"
                                        placeholder="House #, Street name, or landmark..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(0)} className="flex-1 h-16 bg-nature-cream text-nature-brown rounded-[2rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-nature-brown/10 transition-colors"><ChevronLeft size={18} /> Back</button>
                                    <button onClick={() => setStep(2)} className="flex-[2] h-16 bg-nature-green text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-nature-green/20 font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all">Next: Availability <ChevronRight size={18} /></button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><Calendar size={12} /> Day</label>
                                        <select value={day} onChange={(e) => setDay(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-nature-green transition-all">
                                            <option value="">Select Day</option>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Flexible'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-nature-brown-light flex items-center gap-2"><Clock size={12} /> Time</label>
                                        <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-nature-cream/50 border-2 border-nature-cream px-4 py-3 rounded-2xl font-bold text-nature-brown-dark outline-none focus:border-nature-green transition-all" placeholder="E.g. 10:00 AM" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button onClick={() => setStep(1)} className="flex-1 h-16 bg-nature-cream text-nature-brown rounded-[2rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-nature-brown/10 transition-colors"><ChevronLeft size={18} /> Back</button>
                                    <button onClick={onSave} disabled={saving} className={`flex-[2] h-16 bg-nature-green text-white rounded-[2rem] flex items-center justify-center gap-3 shadow-xl font-black uppercase tracking-widest text-sm transition-all ${saving ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95 shadow-nature-green/20'}`}>
                                        {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> {editing ? 'Update' : 'Save'} Visit</>}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);
