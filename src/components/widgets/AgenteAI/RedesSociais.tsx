
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2 } from 'lucide-react';

interface RedesSociaisProps {
  formData: {
    telefone_empresa: string;
    website_empresa: string;
    instagram_empresa?: string;
    facebook_empresa?: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const RedesSociais = memo(function RedesSociais({ formData, onInputChange }: RedesSociaisProps) {
  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return numbers.slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    onInputChange('telefone_empresa', formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Redes Sociais
        </CardTitle>
        <CardDescription>
          URLs das redes sociais da empresa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instagram_empresa">Instagram</Label>
          <Input
            id="instagram_empresa"
            value={formData.instagram_empresa || ''}
            onChange={(e) => onInputChange('instagram_empresa', e.target.value)}
            placeholder="https://instagram.com/sua_empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="facebook_empresa">Facebook</Label>
          <Input
            id="facebook_empresa"
            value={formData.facebook_empresa || ''}
            onChange={(e) => onInputChange('facebook_empresa', e.target.value)}
            placeholder="https://facebook.com/sua_empresa"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone_empresa">WhatsApp</Label>
          <Input
            id="telefone_empresa"
            value={formData.telefone_empresa}
            onChange={handleWhatsAppChange}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_empresa">Website</Label>
          <Input
            id="website_empresa"
            value={formData.website_empresa}
            onChange={(e) => onInputChange('website_empresa', e.target.value)}
            placeholder="https://www.empresa.com"
          />
        </div>
      </CardContent>
    </Card>
  );
});
