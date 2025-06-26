'use client';
import { Card } from '@/components/ui/card';
import { ExternalLink, Shield } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function ProgramsTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Rehabilitative Programs</h2>
      {restorativeData.rehab_programs.length > 0 ? (
        restorativeData.rehab_programs.map((program, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{program.program}</h3>
                <p className="text-gray-600">Type: {program.program_type}</p>
                {(program.start_date || program.end_date) && (
                  <p className="text-sm text-gray-500">
                    {program.start_date ? new Date(program.start_date).toLocaleDateString() : 'N/A'} - {program.end_date ? new Date(program.end_date).toLocaleDateString() : 'Present'}
                  </p>
                )}
                {program.details && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Details:</span> {program.details}
                  </p>
                )}
                {program.narrative && (
                  <p className="text-gray-600 mt-2">
                    <span className="font-medium">Narrative:</span> {program.narrative}
                  </p>
                )}
                {program.file_url && (
                  <div className="mt-2">
                    <a
                      href={program.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      {program.file_name || 'View attachment'} <ExternalLink className="h-3 w-3" />
                    </a>
                    {program.file_size && (
                      <span className="ml-2 text-gray-400 text-xs">({(program.file_size / 1024).toFixed(1)} KB)</span>
                    )}
                  </div>
                )}
              </div>
              <Shield className="h-6 w-6 text-gray-400" />
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No rehabilitative programs recorded</Card>
      )}
    </div>
  );
}
