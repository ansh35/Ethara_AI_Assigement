import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, UserPlus, Mail, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required for identification'),
  email: z.string().email('Invalid operative identifier'),
  password: z.string().min(6, 'Access code must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'MEMBER' }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/auth/register', data);
      login(response.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration sequence aborted');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden p-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] size-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] size-[600px] rounded-full bg-blue-600/5 blur-[150px] animate-pulse pointer-events-none" />
      
      <div className="w-full max-w-[480px] relative z-10 space-y-8">
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex size-16 rounded-[2rem] bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 mb-4 animate-in zoom-in-50 duration-700">
            <LayoutDashboard className="size-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent uppercase">
            Join the Workplace
          </h1>
        </div>

        <Card className="border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <CardHeader className="space-y-1 text-center pt-10 pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-[0.25em] text-muted-foreground/40">Registration</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 px-10 pb-8 pt-6">
              {error && (
                <div className="flex items-center gap-3 p-4 text-[10px] font-black uppercase tracking-widest text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake-1">
                  <AlertCircle className="size-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Full Operative Name</Label>
                  <div className="relative group">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="name" 
                      placeholder="Enter Name" 
                      className="bg-white/[0.03] border-white/5 rounded-2xl h-12 pl-12 pr-6 text-sm font-bold tracking-tight focus:border-primary/50 transition-all shadow-inner"
                      {...register('name')} 
                    />
                  </div>
                  {errors.name && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter Email" 
                      className="bg-white/[0.03] border-white/5 rounded-2xl h-12 pl-12 pr-6 text-sm font-bold tracking-tight focus:border-primary/50 transition-all shadow-inner"
                      {...register('email')} 
                    />
                  </div>
                  {errors.email && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••"
                      className="bg-white/[0.03] border-white/5 rounded-2xl h-12 pl-12 pr-6 text-sm font-bold tracking-tight focus:border-primary/50 transition-all shadow-inner"
                      {...register('password')} 
                    />
                  </div>
                  {errors.password && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1">Security Clearance</Label>
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                    <select
                      id="role"
                      className="flex h-12 w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-12 pr-6 text-sm font-bold tracking-tight focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      {...register('role')}
                    >
                      <option value="MEMBER" className="bg-[#09090b]">MEMBER</option>
                      <option value="ADMIN" className="bg-[#09090b]">ADMIN</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-6 px-10 pb-10">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all font-black text-[10px] uppercase tracking-[0.25em] relative group" 
                disabled={isLoading}
              >
                <span className={cn("transition-all", isLoading ? "opacity-0" : "opacity-100")}>
                  Register
                </span>
                {!isLoading && <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  </div>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  Already Authorized?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
                    Login
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default Register;
