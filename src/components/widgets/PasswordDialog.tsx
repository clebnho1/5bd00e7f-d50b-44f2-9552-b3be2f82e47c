
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface PasswordDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tempPassword: string;
  onGeneratePassword: () => void;
}

export function PasswordDialog({ user, open, onOpenChange, tempPassword, onGeneratePassword }: PasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Gerar Senha Temporária</DialogTitle>
          <DialogDescription>
            Gere uma nova senha temporária para o usuário
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {tempPassword ? (
            <div className="space-y-2">
              <Label>Senha Temporária Gerada:</Label>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                {tempPassword}
              </div>
              <p className="text-xs text-gray-500">
                Copie esta senha e forneça ao usuário. Por segurança, esta senha não será mostrada novamente.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                Clique no botão abaixo para gerar uma nova senha temporária para {user?.email}
              </p>
              <Button onClick={onGeneratePassword} className="whatsapp-gradient text-white">
                Gerar Senha Temporária
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
