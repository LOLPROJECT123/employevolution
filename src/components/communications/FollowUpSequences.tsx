
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';

const FollowUpSequences: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Follow-up Sequences</h2>
          <p className="text-muted-foreground">
            Automate your follow-up communications with smart sequences.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sequence
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Automated follow-up sequences will help you stay in touch with contacts 
            at the right time with personalized messages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpSequences;
