'use client';
import { Card } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function EducationTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Education History</h2>
      {restorativeData.education.length > 0 ? (
        restorativeData.education.map((edu, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{edu.school_name}</h3>
                <p className="text-gray-600">
                  {edu.degree}{' '}
                  {edu.field_of_study && `in ${edu.field_of_study}`}
                </p>
                <p className="text-sm text-gray-500">
                  {edu.start_date} -{' '}
                  {edu.currently_enrolled ? 'Present' : edu.end_date}
                </p>
                {edu.grade && (
                  <p className="text-sm text-gray-600">Grade: {edu.grade}</p>
                )}
                {edu.description && (
                  <p className="text-gray-600 mt-2">{edu.description}</p>
                )}
              </div>
              <GraduationCap className="h-6 w-6 text-gray-400" />
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">
          No education history recorded
        </Card>
      )}
    </div>
  );
}
