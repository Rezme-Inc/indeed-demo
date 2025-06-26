'use client';
import { Card } from '@/components/ui/card';
import { ExternalLink, Facebook, Github, Globe, Instagram, Linkedin, Twitter } from 'lucide-react';
import type { RestorativeData } from '../page';

interface Props {
  restorativeData: RestorativeData;
}

export default function OverviewTab({ restorativeData }: Props) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        {restorativeData.introduction ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Personal Narrative</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {restorativeData.introduction.personal_narrative || 'No narrative provided'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Preferred Occupation</h3>
              <p className="text-gray-600">
                {restorativeData.introduction.preferred_occupation || 'Not specified'}
              </p>
            </div>
            {restorativeData.introduction.language_proficiency && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Language Proficiency</h3>
                <p className="text-gray-600">
                  {restorativeData.introduction.language_proficiency}
                </p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Social Links</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const socialPlatforms = [
                    { key: 'facebook_url', label: 'Facebook', icon: Facebook, bgColor: 'bg-blue-50', textColor: 'text-blue-600', hoverColor: 'hover:bg-blue-100' },
                    { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, bgColor: 'bg-blue-50', textColor: 'text-blue-600', hoverColor: 'hover:bg-blue-100' },
                    { key: 'reddit_url', label: 'Reddit', icon: Globe, bgColor: 'bg-orange-50', textColor: 'text-orange-600', hoverColor: 'hover:bg-orange-100' },
                    { key: 'digital_portfolio_url', label: 'Portfolio', icon: Globe, bgColor: 'bg-purple-50', textColor: 'text-purple-600', hoverColor: 'hover:bg-purple-100' },
                    { key: 'instagram_url', label: 'Instagram', icon: Instagram, bgColor: 'bg-pink-50', textColor: 'text-pink-600', hoverColor: 'hover:bg-pink-100' },
                    { key: 'github_url', label: 'GitHub', icon: Github, bgColor: 'bg-gray-50', textColor: 'text-gray-700', hoverColor: 'hover:bg-gray-100' },
                    { key: 'tiktok_url', label: 'TikTok', icon: Globe, bgColor: 'bg-red-50', textColor: 'text-red-600', hoverColor: 'hover:bg-red-100' },
                    { key: 'pinterest_url', label: 'Pinterest', icon: Globe, bgColor: 'bg-red-50', textColor: 'text-red-600', hoverColor: 'hover:bg-red-100' },
                    { key: 'twitter_url', label: 'X (Twitter)', icon: Twitter, bgColor: 'bg-black', textColor: 'text-white', hoverColor: 'hover:bg-gray-800' },
                    { key: 'personal_website_url', label: 'Website', icon: ExternalLink, bgColor: 'bg-purple-50', textColor: 'text-purple-600', hoverColor: 'hover:bg-purple-100' },
                    { key: 'handshake_url', label: 'Handshake', icon: Globe, bgColor: 'bg-green-50', textColor: 'text-green-600', hoverColor: 'hover:bg-green-100' },
                  ];

                  return socialPlatforms
                    .map((platform) => {
                      const url = restorativeData.introduction[platform.key];
                      if (!url) return null;
                      const IconComponent = platform.icon;
                      return (
                        <a
                          key={platform.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1 px-3 py-1 ${platform.bgColor} ${platform.textColor} rounded-full ${platform.hoverColor} transition-colors`}
                        >
                          <IconComponent className="h-4 w-4" />
                          {platform.label}
                        </a>
                      );
                    })
                    .filter(Boolean);
                })()}
                {(() => {
                  const socialPlatforms = [
                    'facebook_url',
                    'linkedin_url',
                    'reddit_url',
                    'digital_portfolio_url',
                    'instagram_url',
                    'github_url',
                    'tiktok_url',
                    'pinterest_url',
                    'twitter_url',
                    'personal_website_url',
                    'handshake_url',
                  ];
                  const hasAnySocialLinks = socialPlatforms.some(
                    (key) => restorativeData.introduction[key]
                  );
                  if (!hasAnySocialLinks) {
                    return <span className="text-gray-500 italic text-sm">No social media links provided</span>;
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No introduction provided</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {restorativeData.education.length}
            </div>
            <div className="text-sm text-gray-600">Education Entries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {restorativeData.employment.length}
            </div>
            <div className="text-sm text-gray-600">Work Experiences</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {restorativeData.awards.length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {restorativeData.skills.length}
            </div>
            <div className="text-sm text-gray-600">Skills Listed</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
