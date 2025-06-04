
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Contact Information</CardTitle>
        <Button variant="ghost" size="sm" onClick={onEdit} className="text-gray-400 hover:text-white">
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-blue-400" />
          <span className="text-gray-300">{data.email || 'No email provided'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="h-5 w-5 text-blue-400" />
          <span className="text-gray-300">{data.phone || 'No phone number provided'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="h-5 w-5 text-blue-400" />
          <span className="text-gray-300">{data.location || 'No location provided'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
