
"use client"

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BriefcaseIcon, FileTextIcon, SearchIcon, Settings } from 'lucide-react';
import { FeatureCard } from '@/types/dashboard';

interface FeatureCardsProps {
  cards?: FeatureCard[];
}

const FeatureCards = ({ cards }: FeatureCardsProps) => {
  const defaultCards = [
    {
      id: '1',
      title: 'Search Jobs',
      description: 'Browse through thousands of job listings tailored to your skills.',
      icon: 'search',
      color: '#E4F3FF',
      link: '/jobs'
    },
    {
      id: '2',
      title: 'Track Applications',
      description: 'Keep track of all your job applications in one place.',
      icon: 'briefcase',
      color: '#F8E4FF',
      link: '/job-tracker'
    },
    {
      id: '3',
      title: 'Resume Builder',
      description: 'Create and customize your resume with our easy-to-use tools.',
      icon: 'file-text',
      color: '#E4FFE7',
      link: '/documents'
    },
    {
      id: '4',
      title: 'Match Preferences',
      description: 'Customize your job match preferences for better results.',
      icon: 'settings',
      color: '#FFE4D6',
      link: '/profile'
    }
  ];

  const featureCards = cards || defaultCards;
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'search':
        return <SearchIcon className="h-6 w-6" />;
      case 'briefcase':
        return <BriefcaseIcon className="h-6 w-6" />;
      case 'file-text':
        return <FileTextIcon className="h-6 w-6" />;
      case 'settings':
        return <Settings className="h-6 w-6" />;
      default:
        return <BriefcaseIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {featureCards.map((card) => (
        <Link to={card.link} key={card.id}>
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: card.color }}
              >
                {getIcon(card.icon)}
              </div>
              <h3 className="font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <div className="flex items-center text-sm text-primary">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default FeatureCards;
