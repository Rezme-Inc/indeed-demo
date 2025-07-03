'use client';
import { Card } from '@/components/ui/card';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function PersonalTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Hobbies & Interests</h2>
      {restorativeData.hobbies.length > 0 ? (
        restorativeData.hobbies.map((hobby, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{hobby.name}</h3>
              <p className="text-gray-600">Category: {hobby.category}</p>
              <p className="text-sm text-gray-500">Proficiency: {hobby.proficiency_level}</p>
              {hobby.description && (
                <p className="text-gray-600 mt-2">{hobby.description}</p>
              )}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No hobbies recorded</Card>
      )}
    </div>
  );
}
