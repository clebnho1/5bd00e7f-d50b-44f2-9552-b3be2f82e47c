
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface EditPlanDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { plano: string; expirationDate: string }) => void;
}

export function EditPlanDialog({ user, open, onOpenChange, onSave }: EditPlanDialogProps) {
  const [planData, setPlanData] = useState({
    plano: '',
    expirationDate: ''
  });

  useEffect(() => {
    if (user) {
      setPlanData({
        plano: user.plano || '',
        expirationDate: user.plano_expires_at ? new Date(user.plano_expires_at).toISOString().split('T')[0] : 
                        user.trial_expires_at ? new Date(user.trial_expires_at).toISOString().split('T')[0] : ''
      });
    }
  }, [user]);

  const handlePlanChange = (field: string, value: string) => {
    setPlanData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!planData.plano) {
      return;
    }
    onSave(planData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Alterar Plano do Usuário</DialogTitle>
          <DialogDescription>
            Atualize o plano e data de expiração do usuário
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plano">Plano</Label>
            <Select value={planData.plano} onValueChange={(value) => handlePlanChange('plano', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gratuito">Gratuito (7 dias)</SelectItem>
                <SelectItem value="profissional">Profissional (30 dias)</SelectItem>
                <SelectItem value="empresarial">Empresarial (30 dias)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expirationDate">Data de Expiração</Label>
            <Input
              id="expirationDate"
              type="date"
              value={planData.expirationDate}
              onChange={(e) => handlePlanChange('expirationDate', e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Deixe em branco para usar o padrão (7 dias para gratuito, 30 dias para pagos)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="whatsapp-gradient text-white"
          >
            Atualizar Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
