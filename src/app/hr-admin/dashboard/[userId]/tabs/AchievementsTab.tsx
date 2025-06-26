'use client';
import { Card } from '@/components/ui/card';
import { Award, ExternalLink } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function AchievementsTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Awards & Achievements</h2>
      {restorativeData.awards.length > 0 ? (
        restorativeData.awards.map((award, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{award.name}</h3>
                <p className="text-gray-600">
                  {award.type} • {award.organization}
                </p>
                <p className="text-sm text-gray-500">Received: {award.date}</p>
                {award.narrative && (
                  <p className="text-gray-600 mt-2">{award.narrative}</p>
                )}
              </div>
              <Award className="h-6 w-6 text-gray-400" />
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No awards recorded</Card>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">Microcredentials</h2>
      {restorativeData.micro_credentials.length > 0 ? (
        restorativeData.micro_credentials.map((cred, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{cred.name}</h3>
              <p className="text-gray-600">Issued by: {cred.issuing_organization}</p>
              <p className="text-sm text-gray-500">
                Issued: {cred.issue_date}
                {cred.expiry_date && ` • Expires: ${cred.expiry_date}`}
              </p>
              {cred.credential_id && (
                <p className="text-sm text-gray-600">ID: {cred.credential_id}</p>
              )}
              {cred.credential_url && (
                <a
                  href={cred.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  View Credential <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No microcredentials recorded</Card>
      )}
    </div>
  );
}
