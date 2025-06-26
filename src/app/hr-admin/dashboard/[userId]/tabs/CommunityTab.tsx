'use client';
import { Card } from '@/components/ui/card';
import { ExternalLink, Linkedin, Users } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function CommunityTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Community Engagement</h2>
      {restorativeData.community_engagements.length > 0 ? (
        restorativeData.community_engagements.map((engagement, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{engagement.organization_name}</h3>
                <p className="text-gray-600">
                  {engagement.type} • {engagement.role}
                </p>
                {engagement.organization_website && (
                  <a
                    href={engagement.organization_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                  >
                    Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {engagement.details && (
                  <p className="text-gray-600 mt-2">{engagement.details}</p>
                )}
              </div>
              <Users className="h-6 w-6 text-gray-400" />
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No community engagement recorded</Card>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">Mentors</h2>
      {restorativeData.mentors.length > 0 ? (
        restorativeData.mentors.map((mentor, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{mentor.name}</h3>
              <p className="text-gray-600">
                {mentor.title} at {mentor.company}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {mentor.email && <span>Email: {mentor.email}</span>}
                {mentor.phone && <span>Phone: {mentor.phone}</span>}
              </div>
              {mentor.linkedin_profile && (
                <a
                  href={mentor.linkedin_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  <Linkedin className="h-3 w-3" /> LinkedIn Profile
                </a>
              )}
              {mentor.narrative && <p className="text-gray-600 mt-2">{mentor.narrative}</p>}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No mentors recorded</Card>
      )}
    </div>
  );
}
