
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface PersonalInfoSectionProps {
  data: {
    name: string;
    email: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onChange: (data: any) => void;
}

const PersonalInfoSection = ({ data, onChange }: PersonalInfoSectionProps) => {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            readOnly
            className="bg-gray-50 cursor-not-allowed"
            placeholder="Your email from sign-up"
          />
          <p className="text-xs text-gray-500">Email cannot be changed (from your account)</p>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter your current phone number"
          />
          <p className="text-xs text-gray-500">Please enter your current phone number</p>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="streetAddress">Street Address *</Label>
          <Input
            id="streetAddress"
            value={data.streetAddress}
            onChange={(e) => handleChange('streetAddress', e.target.value)}
            placeholder="Enter your street address (house number, street name, apt/unit)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter your city"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => handleChange('state', e.target.value)}
            placeholder="Enter your state"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            placeholder="Enter your ZIP code"
          />
          <p className="text-xs text-gray-500">Please enter your current residential address information</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
