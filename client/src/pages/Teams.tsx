import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Search, Shield } from 'lucide-react';
import CreateTeamModal from '@/components/CreateTeamModal';
import TeamMembersModal from '@/components/TeamMembersModal';
import { Badge } from '@/components/ui/badge';


const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const { user } = useAuthStore();

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to fetch teams', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Initializing Team Network...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">Team Command</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.25em] opacity-60">Managing organizational hierarchy and operative access</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all h-11 font-black text-[10px] uppercase tracking-widest px-8"
            >
              <Plus className="size-4 mr-2" />
              Create Team
            </Button>
          )}
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <Users className="size-5 text-primary" />
            Active Battalions
          </CardTitle>
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Locate Workplace..."
              className="bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary/50 transition-all w-64 shadow-inner"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {teams.length === 0 ? (
            <div className="py-32 text-center">
              <div className="size-20 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="size-10 text-muted-foreground/20" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">No Active Teams Mobilized</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Workplace Designation</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Operational Brief</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Operative Density</TableHead>
                    <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Command</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team._id} className="group hover:bg-white/[0.04] transition-all border-white/5 relative overflow-hidden">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-lg shadow-primary/5">
                            <Shield className="size-5" />
                          </div>
                          <span className="font-black text-base group-hover:text-primary transition-colors tracking-tight">{team.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <p className="text-sm font-bold text-muted-foreground/40 max-w-[400px] truncate uppercase tracking-wider">{team.description || 'No brief provided'}</p>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2.5">
                            {[...Array(Math.min(team.members?.length || 0, 3))].map((_, i) => (
                              <div key={i} className="size-9 rounded-xl border-4 border-[#09090b] bg-white/5 flex items-center justify-center text-[11px] font-black text-muted-foreground shadow-xl">
                                {team.members[i]?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            ))}
                            {team.members?.length > 3 && (
                              <div className="size-9 rounded-xl border-4 border-[#09090b] bg-primary/20 flex items-center justify-center text-[11px] font-black text-primary shadow-xl">
                                +{team.members.length - 3}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary" className="rounded-lg bg-white/[0.03] border-white/5 text-[10px] font-black uppercase tracking-widest px-3 py-1 ml-2">
                            {team.members?.length || 0} OPERATIVES
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8 relative z-10">
                        {user?.role === 'ADMIN' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-primary/20 shadow-lg"
                            onClick={() => {
                              setSelectedTeam(team);
                              setIsMembersModalOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            MANAGE WORKPLACE
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTeams}
      />

      <TeamMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onUpdate={fetchTeams}
      />
    </div>
  );
};

export default Teams;
