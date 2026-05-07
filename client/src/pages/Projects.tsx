import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Users, Plus, FolderKanban, Search } from 'lucide-react';
import TeamManagementModal from '@/components/TeamManagementModal';
import CreateProjectModal from '@/components/CreateProjectModal';
import ProjectDetailModal from '@/components/ProjectDetailModal';


const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { user } = useAuthStore();

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/projects');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchProjects();
    if (selectedProject) {
      const updated = projects.find(p => p._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      const updated = projects.find(p => p._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    }
  }, [projects]);

  useEffect(() => {
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Accessing Project Nodes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">Project Matrix</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.25em] opacity-60">Architecting and monitoring mission-critical objectives</p>
        </div>
        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all h-11 font-black text-[10px] uppercase tracking-widest px-8"
            >
              <Plus className="size-4 mr-2" />
              Initialize Project
            </Button>
          )}
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <FolderKanban className="size-5 text-primary" />
            Active Repositories
          </CardTitle>
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search Repos..."
              className="bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary/50 transition-all w-64 shadow-inner"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="py-32 text-center">
              <div className="size-20 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FolderKanban className="size-10 text-muted-foreground/20" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">No Active Projects Detected</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Project Architecture</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Lead Strategist</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Workplace Allocation</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Timestamp</TableHead>
                    <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Command</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project._id}
                      className="group hover:bg-white/[0.04] transition-all border-white/5 cursor-pointer relative overflow-hidden"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className="font-black text-base group-hover:text-primary transition-colors tracking-tight">{project.title}</span>
                          <span className="text-[11px] font-bold text-muted-foreground/40 truncate max-w-[300px] uppercase tracking-wider">{project.description}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-black relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-primary">
                            {project.createdBy?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span className="opacity-80 group-hover:opacity-100 transition-opacity tracking-tight">{project.createdBy?.name || 'System'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 w-fit group-hover:border-primary/20 transition-all">
                          <Users className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{project.members?.length || 0} OPERATIVES</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.15em] relative z-10">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right px-8 relative z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-primary/20 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(project);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          VIEW INTEL
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onUpdate={handleUpdate}
      />

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProjects}
      />
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProject(null);
        }}
        onManageTeam={() => {
          setIsDetailModalOpen(false);
          setIsTeamModalOpen(true);
        }}
        isAdmin={user?.role === 'ADMIN'}
      />
    </div>
  );
};

export default Projects;
