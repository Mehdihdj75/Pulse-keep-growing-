import React, { useEffect, useState } from 'react';
import { Search, Filter, UserPlus, Mail, Phone, Users, Building2, MoreHorizontal, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Profile } from '../types';
import { InviteMemberModal } from '../components/InviteMemberModal';

export default function Team() {
    const { profile } = useAuth();
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const fetchTeam = async () => {
        if (!profile?.entreprise_id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('entreprise_id', profile.entreprise_id);

            if (error) throw error;
            setMembers(data || []);
        } catch (err) {
            console.error('Error fetching team:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, [profile]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-brand-midnight tracking-tight">Mon Équipe</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Gérez les membres de votre entreprise.</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center space-x-3 px-6 py-4 bg-brand-turquoise text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-turquoise-dark transition-all shadow-xl shadow-brand-turquoise/20 hover:-translate-y-1 active:scale-95"
                >
                    <UserPlus size={18} />
                    <span>Inviter un membre</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-turquoise/10 rounded-2xl flex items-center justify-center text-brand-turquoise">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membres</p>
                        <h4 className="text-2xl font-black text-brand-midnight">{members.length}</h4>
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Members List */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Membre</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rôle</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Chargement...</td></tr>
                            ) : members.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Aucun membre trouvé.</td></tr>
                            ) : (
                                members.map(member => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.prenom}+${member.nom}`}
                                                    className="w-10 h-10 rounded-full bg-slate-100"
                                                    alt=""
                                                />
                                                <div>
                                                    <p className="font-bold text-brand-midnight">{member.prenom} {member.nom}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${member.role === 'MANAGER' ? 'bg-indigo-50 text-indigo-600' :
                                                    member.role === 'DIRECTEUR' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-slate-100 text-slate-500'
                                                }`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                            {member.email}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 text-slate-300 hover:text-brand-midnight transition-colors">
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InviteMemberModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={fetchTeam}
            />
        </div>
    );
}
