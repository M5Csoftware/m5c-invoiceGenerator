import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceHeader } from '@/types/invoice';
import { Building2, MapPin, Truck, Ship } from 'lucide-react';

interface InvoiceFormProps {
  header: InvoiceHeader;
  onChange: (header: InvoiceHeader) => void;
}

export function InvoiceForm({ header, onChange }: InvoiceFormProps) {
  const handleChange = (field: keyof InvoiceHeader, value: string) => {
    onChange({ ...header, [field]: value });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Company Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={header.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={header.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Street, City, ZIP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eori">EORI Number</Label>
            <Input
              id="eori"
              value={header.eori}
              onChange={(e) => handleChange('eori', e.target.value)}
              placeholder="EORI-XXXXXXXXXXXX"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={header.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={header.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@company.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Origin & Destination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="countryOfOrigin">Country of Origin</Label>
              <Input
                id="countryOfOrigin"
                value={header.countryOfOrigin}
                onChange={(e) => handleChange('countryOfOrigin', e.target.value)}
                placeholder="INDIA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalDestination">Final Destination</Label>
              <Input
                id="finalDestination"
                value={header.finalDestination}
                onChange={(e) => handleChange('finalDestination', e.target.value)}
                placeholder="EUROPE (AMS)"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="portOfDischarge">Port of Discharge</Label>
              <Input
                id="portOfDischarge"
                value={header.portOfDischarge}
                onChange={(e) => handleChange('portOfDischarge', e.target.value)}
                placeholder="DEL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portOfDestination">Port of Destination</Label>
              <Input
                id="portOfDestination"
                value={header.portOfDestination}
                onChange={(e) => handleChange('portOfDestination', e.target.value)}
                placeholder="AMS"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Truck className="h-5 w-5 text-primary" />
            Pre-Carriage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preCarriageBy">Pre-Carriage By</Label>
            <Input
              id="preCarriageBy"
              value={header.preCarriageBy}
              onChange={(e) => handleChange('preCarriageBy', e.target.value)}
              placeholder="Transport method"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="placeOfReceipt">Place of Receipt</Label>
            <Input
              id="placeOfReceipt"
              value={header.placeOfReceipt}
              onChange={(e) => handleChange('placeOfReceipt', e.target.value)}
              placeholder="Place of receipt by pre-carrier"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ship className="h-5 w-5 text-primary" />
            Shipping Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vesselFlightNo">Vessel / Flight No.</Label>
            <Input
              id="vesselFlightNo"
              value={header.vesselFlightNo}
              onChange={(e) => handleChange('vesselFlightNo', e.target.value)}
              placeholder="NA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portOfLoading">Port of Loading</Label>
            <Input
              id="portOfLoading"
              value={header.portOfLoading}
              onChange={(e) => handleChange('portOfLoading', e.target.value)}
              placeholder="IGI DELHI"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
