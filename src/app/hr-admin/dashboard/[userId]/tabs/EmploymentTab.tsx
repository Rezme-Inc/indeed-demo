'use client';
import { Card } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function EmploymentTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Employment History</h2>
      {restorativeData.employment.length > 0 ? (
        restorativeData.employment.map((job, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">
                  {job.city}, {job.state} • {job.employment_type}
                </p>
                <p className="text-sm text-gray-500">
                  {job.start_date} -{' '}
                  {job.currently_employed ? 'Present' : job.end_date}
                </p>
                {job.incarcerated && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Employed while incarcerated
                  </span>
                )}
              </div>
              <Briefcase className="h-6 w-6 text-gray-400" />
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No employment history recorded</Card>
      )}
    </div>
  );
}
