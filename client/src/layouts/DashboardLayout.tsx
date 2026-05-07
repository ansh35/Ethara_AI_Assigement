import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, User as UserIcon, Users2, Search, X, Mail, Shield, Calendar, Clock, Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DashboardLayout = () => {
  const { user, logout, updateUser } = useAuthStore();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectsCount, setProjectsCount] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProjectsCount = async () => {
      try {
        const response = await api.get('/projects');
        setProjectsCount(response.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch projects count', error);
      }
    };
    if (user) fetchProjectsCount();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Teams', href: '/teams', icon: Users2 },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const response = await api.put('/auth/profile', editForm);
      updateUser(response.data);
      setIsEditingProfile(false);
      setIsUserModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] font-sans text-foreground selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] size-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[500px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-white/10 bg-white/[0.01] backdrop-blur-2xl flex flex-col transition-all duration-300 ease-in-out">
        <div className="flex h-16 items-center border-b border-white/5 px-6 bg-white/[0.02]">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-110">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">SyncOps</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-10">
          <nav className="space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Main Menu</p>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />}
                  <item.icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <nav className="space-y-2">
            <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4">Workspace</p>
            <Link
              to="/teams"
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                location.pathname === '/teams'
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {location.pathname === '/teams' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full" />}
              <Users2 className={cn("size-5 transition-transform duration-300 group-hover:scale-110", location.pathname === '/teams' ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              Manage Teams
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-4 space-y-4 border-t border-white/5 bg-white/[0.02]">
          <div 
            className="flex items-center gap-3 px-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md shadow-sm group hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer relative overflow-hidden"
            onClick={() => setIsUserModalOpen(true)}
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors" />
            
            <div className="relative">
              <div className="size-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 group-hover:shadow-primary/20 transition-all group-hover:scale-105">
                <span className="text-sm font-black text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  {(user.name || 'User').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[#09090b] border-2 border-[#09090b] flex items-center justify-center">
                <div className="size-full rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
            </div>

            <div className="flex flex-col overflow-hidden relative z-10">
              <span className="text-sm font-bold truncate leading-none mb-1.5 group-hover:text-primary transition-colors">{user.name}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                {user.role} • <span className="text-emerald-500/80">Online</span>
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-center gap-3 h-12 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl group/logout" 
            onClick={logout}
          >
            <LogOut className="size-4 group-hover/logout:-translate-x-1 transition-transform" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64 w-full flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-white/[0.02] backdrop-blur-2xl px-8 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4">
            <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <h1 className="text-lg font-bold tracking-tight capitalize text-foreground/90">
              {location.pathname === '/' ? 'Overview' : location.pathname.split('/')[1]}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="relative hidden md:flex items-center w-72 group text-left"
            >
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors">
                <Search className="size-4" />
              </span>
              <div className="h-10 w-full rounded-xl border border-white/5 bg-white/[0.03] pl-10 pr-4 text-sm flex items-center text-muted-foreground/40 group-hover:bg-white/[0.05] transition-all">
                Search resources, tasks...
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </button>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <button 
              className="size-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-primary/30 transition-all relative group"
              onClick={() => setIsUserModalOpen(true)}
            >
              <span className="text-xs font-black text-foreground/80 group-hover:text-primary transition-colors">
                {(user.name || 'User').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
              <div className="absolute -top-1 -right-1 size-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity blur-[2px]" />
            </button>
          </div>
        </header>

        {/* Global Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0c0c0e]/90 border border-white/10 rounded-2xl shadow-2xl shadow-black overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center p-4 border-b border-white/5">
                <Search className="size-5 text-primary mr-3" />
                <input 
                  autoFocus
                  placeholder="Type to search projects, tasks, or members..."
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground">
                  <X className="size-5" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
                {searchQuery ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Results for "{searchQuery}"</p>
                    <div className="space-y-1">
                      {['Projects', 'Tasks', 'Team Members'].map(category => (
                        <div key={category} className="p-3 rounded-xl hover:bg-white/5 cursor-pointer group flex items-center justify-between transition-all">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Search className="size-4" />
                            </div>
                            <span className="font-medium">Search in {category}</span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">GO TO →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {navigation.map(item => (
                        <Link 
                          key={item.name} 
                          to={item.href} 
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                          <item.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="font-medium">Go to {item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-muted-foreground font-medium px-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/5">ESC</kbd> to close</span>
                  <span className="flex items-center gap-1.5"><kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/5">↵</kbd> to select</span>
                </div>
                <span>TEAMTASK SEARCH v1.0</span>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <Dialog 
          isOpen={isUserModalOpen} 
          onClose={() => {
            setIsUserModalOpen(false);
            setIsEditingProfile(false);
          }} 
          title={isEditingProfile ? "Edit Profile" : "User Profile"}
        >
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6 py-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                  <Input 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="rounded-xl bg-white/[0.03] border-white/10"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                  <Input 
                    type="email"
                    value={editForm.email} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="rounded-xl bg-white/[0.03] border-white/10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-xl border-white/10"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl shadow-lg shadow-primary/20"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                  <Save className="size-4 ml-2" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8 py-2 animate-in fade-in zoom-in-95 duration-300">
              {/* Header Info */}
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <UserIcon className="size-24" />
                </div>
                <div className="size-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 relative z-10">
                  <UserIcon className="size-10" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {user.role}
                    </span>
                    <span className="text-muted-foreground text-sm">•</span>
                    <span className="text-muted-foreground text-sm">Active Now</span>
                  </div>
                </div>
              </div>

              {/* Detailed Stats/Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mail className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Email Address</span>
                  </div>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Shield className="size-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Account Status</span>
                  </div>
                  <p className="text-sm font-medium text-green-400">Verified Professional</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Professional Overview</h4>
                <div className="space-y-2">
                  {[
                    { icon: Calendar, label: 'Joined Team', value: 'May 2024' },
                    { icon: Clock, label: 'Last Activity', value: '2 minutes ago' },
                    { icon: LayoutDashboard, label: 'Projects Managed', value: `${projectsCount} Active` }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <item.icon className="size-4" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  className="flex-1 rounded-xl shadow-lg shadow-primary/20" 
                  onClick={() => {
                    setEditForm({ name: user.name, email: user.email });
                    setIsEditingProfile(true);
                  }}
                >
                  <Edit2 className="size-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-white/10 hover:bg-destructive/10 hover:text-destructive transition-all font-black text-[10px] uppercase tracking-widest" 
                  onClick={logout}
                >
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </Dialog>
        <main className="flex-1 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
