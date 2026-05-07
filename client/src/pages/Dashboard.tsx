import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, FolderKanban, ListTodo, RefreshCw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardData {
  totalProjects: number;
  activeTasks: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  recentActivity: any[];
  statusSummary: {
    TODO: number;
    IN_PROGRESS: number;
    DONE: number;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchDashboard = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      
      const response = await api.get('/dashboard');
      const stats = response.data;
      setData({
        ...stats,
        activeTasks: (stats.statusSummary?.TODO || 0) + (stats.statusSummary?.IN_PROGRESS || 0)
      });
      
      if (silent) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => fetchDashboard(true);

  if (isLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Syncing Neural Links...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">Executive Overview</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.25em] opacity-60">Real-time workspace intelligence</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={cn(
            "rounded-2xl border-white/10 bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.08] transition-all min-w-[140px] h-10 font-black uppercase tracking-[0.15em] text-[10px] shadow-2xl",
            showSuccess && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
          )}
        >
          {showSuccess ? (
            <Check className="size-3.5 mr-2" />
          ) : (
            <RefreshCw className={cn("size-3.5 mr-2", isRefreshing && "animate-spin")} />
          )}
          {showSuccess ? 'DATA SYNCED' : isRefreshing ? 'SYNCING...' : 'REFRESH INTEL'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Projects', value: data.totalProjects, desc: 'Active in workspace', icon: FolderKanban, color: 'primary' },
          { title: 'Active Tasks', value: data.activeTasks, desc: 'Currently in production', icon: ListTodo, color: 'blue-500' },
          { title: 'Completed', value: data.completedTasks, desc: 'Successfully deployed', icon: CheckCircle2, color: 'emerald-500' },
          { title: 'Overdue', value: data.overdueTasks, desc: 'Needs critical attention', icon: AlertCircle, color: 'destructive' }
        ].map((stat, i) => (
          <Card key={i} className="group relative overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur-xl rounded-[1.5rem] transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05] shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className={cn("size-16 -mr-4 -mt-4", i === 0 ? "text-primary" : i === 1 ? "text-blue-500" : i === 2 ? "text-emerald-500" : "text-destructive")} />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-1 relative z-10 px-6 pt-6">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{stat.title}</CardTitle>
              <div className={cn(
                "p-2 rounded-xl border backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                stat.color === 'primary' ? "bg-primary/10 border-primary/30 text-primary" :
                stat.color === 'blue-500' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                stat.color === 'emerald-500' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                "bg-destructive/10 border-destructive/30 text-destructive"
              )}>
                <stat.icon className="size-3.5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2 px-6 pb-6">
              <div className={cn(
                "text-3xl font-black tracking-tighter",
                stat.color === 'destructive' ? "text-destructive" : "text-foreground"
              )}>{stat.value}</div>
              <p className="text-[9px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - Fixed Height for One-Page Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0">
        <Card className="col-span-4 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative max-h-[500px]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Activity Stream</CardTitle>
            <Badge variant="secondary" className="rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border-white/10">Live Updates</Badge>
          </CardHeader>
          <CardContent className="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              {(data.recentActivity?.length || 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="size-16 rounded-[1.5rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 shadow-inner">
                    <ListTodo className="size-8 text-muted-foreground/20" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30">Static Horizon Detected</p>
                </div>
              ) : (
                data.recentActivity?.map((task) => (
                  <div key={task._id} className="flex items-center gap-4 group cursor-default p-3 rounded-[1rem] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 shadow-none hover:shadow-xl">
                    <div className="size-10 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all">
                      <FolderKanban className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                          {task.project?.title || 'GENERAL'}
                        </span>
                        <div className="size-1 rounded-full bg-white/20" />
                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                          {format(new Date(task.updatedAt), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <Badge variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'secondary'} className="rounded-lg px-3 py-0.5 text-[9px] font-black uppercase tracking-wider border-white/5">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[500px]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <CardHeader className="border-b border-white/5 bg-white/[0.01] px-6 py-4">
            <CardTitle className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="px-8 py-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-10">
              {[
                { label: 'To Do', value: data.statusSummary?.TODO || 0, color: 'text-muted-foreground/40', bar: 'bg-muted-foreground/40' },
                { label: 'In Progress', value: data.statusSummary?.IN_PROGRESS || 0, color: 'text-blue-400', bar: 'bg-blue-500' },
                { label: 'Completed', value: data.statusSummary?.DONE || 0, color: 'text-emerald-400', bar: 'bg-emerald-500' }
              ].map((status, i) => {
                const percentage = (status.value / (data.totalTasks || 1)) * 100;
                return (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <div className={cn("size-1.5 rounded-full", status.bar)} />
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", status.color)}>{status.label}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums">{status.value}</span>
                    </div>
                    <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5 p-0.5 relative">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out", status.bar)} 
                        style={{ 
                          width: `${percentage}%`,
                          boxShadow: `0 0 10px ${status.label.includes('In Progress') ? 'rgba(59,130,246,0.3)' : status.label.includes('Completed') ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}`
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-10">
              <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 border-dashed relative overflow-hidden group hover:bg-white/[0.08] transition-all text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2 block">Efficiency Rating</span>
                <p className="text-xs font-bold leading-relaxed text-foreground/90">
                  You've finalized <span className="text-emerald-400 font-black">{Math.round((data.completedTasks / (data.totalTasks || 1)) * 100)}%</span> of workspace objectives.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
