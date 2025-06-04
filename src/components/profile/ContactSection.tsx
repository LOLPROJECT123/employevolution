
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { MapPin, Phone, Mail, Edit } from 'lucide-react';

interface ContactSectionProps {
  data: {
    phone: string;
    location: string;
    email: string;
  };
  onEdit: () => void;
}

const ContactSection = ({ data, onEdit }: ContactSectionProps) => {
  const { theme } = useTheme();

  return (
    <Card className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Contact Information</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit} className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-blue-400" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.email || 'No email provided'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-blue-400" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.phone || 'No phone number provided'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-blue-400" />
          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{data.location || 'No location provided'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
