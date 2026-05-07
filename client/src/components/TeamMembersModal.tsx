import React, { useState } from 'react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { UserPlus } from 'lucide-react';
import api from '@/services/api';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any | null;
  onUpdate: () => void;
}

const TeamMembersModal: React.FC<TeamMembersModalProps> = ({ isOpen, onClose, team, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !email) return;

    try {
      setIsAdding(true);
      setError(null);
      await api.post(`/teams/${team._id}/members`, { email });
      setEmail('');
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Manage Team Members - ${team?.name}`}>
      <div className="space-y-6">
        <form onSubmit={handleAddMember} className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="email">Add Member by Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={isAdding}>
                <UserPlus className="h-4 w-4 mr-2" />
                {isAdding ? 'Adding...' : 'Add'}
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </form>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Current Members ({team?.members?.length || 0})</h3>
          <div className="max-h-[300px] overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team?.members?.map((member: any) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default TeamMembersModal;
