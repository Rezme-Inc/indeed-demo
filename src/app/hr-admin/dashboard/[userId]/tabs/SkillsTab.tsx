'use client';
import { Card } from '@/components/ui/card';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function SkillsTab({ restorativeData }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Skills</h2>
      {restorativeData.skills.length > 0 ? (
        restorativeData.skills.map((skill, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-4">
              {skill.soft_skills && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(skill.soft_skills) ? skill.soft_skills : [skill.soft_skills]).map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skill.hard_skills && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Hard Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(skill.hard_skills) ? skill.hard_skills : [skill.hard_skills]).map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skill.other_skills && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Other Skills</h3>
                  <p className="text-gray-600">{skill.other_skills}</p>
                </div>
              )}
              {skill.narrative && <p className="text-gray-600 mt-2">{skill.narrative}</p>}
            </div>
          </Card>
        ))
      ) : (
        <Card className="p-6 text-center text-gray-500">No skills recorded</Card>
      )}
    </div>
  );
}
