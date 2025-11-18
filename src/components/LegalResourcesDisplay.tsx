"use client";

import { useState } from 'react';
import { LegalResource, getAllJurisdictions } from '@/data/legalResources';
import { ExternalLink, Phone, Mail, Globe, ChevronDown, ChevronRight, ChevronUp, Scale, FileText, Users, Clock } from 'lucide-react';

interface LegalResourcesDisplayProps {
  resources: LegalResource[];
  userState?: string;
  userCity?: string;
}

export default function LegalResourcesDisplay({ resources, userState, userCity }: LegalResourcesDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedJurisdictions, setExpandedJurisdictions] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleJurisdiction = (jurisdiction: string) => {
    setExpandedJurisdictions(prev => ({
      ...prev,
      [jurisdiction]: !prev[jurisdiction]
    }));
  };

  if (resources.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Scale className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Location Information Needed
            </h3>
            <p className="text-sm text-yellow-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              To show you specific legal resources for your area, please update your location information in your profile settings (city and state).
            </p>
            <p className="text-sm text-yellow-800 mt-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              In the meantime, we're showing federal resources that apply nationwide.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with location info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Scale className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your Fair Chance Hiring Rights
            </h3>
            <p className="text-sm text-blue-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Based on your location {userCity && userState ? `(${userCity}, ${userState})` : userState ? `(${userState})` : ''}, 
              the following Fair Chance Hiring laws may apply to you. These laws protect your rights during the hiring process.
            </p>
          </div>
        </div>
      </div>

      {/* Display each jurisdiction's resources */}
      {resources.map((resource, index) => {
        const jurisdictionKey = `${resource.jurisdiction}-${index}`;
        const isExpanded = expandedJurisdictions[jurisdictionKey];
        
        return (
          <div 
            key={jurisdictionKey} 
            className="bg-white border rounded-xl overflow-hidden" 
            style={{ borderColor: '#E5E5E5' }}
          >
            {/* Jurisdiction Header - Clickable */}
            <button
              onClick={() => toggleJurisdiction(jurisdictionKey)}
              className="w-full bg-gray-50 px-6 py-4 border-b hover:bg-gray-100 transition-colors"
              style={{ borderColor: '#E5E5E5' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: '#E54747' }} />
                  ) : (
                    <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: '#595959' }} />
                  )}
                  <h2 className="text-xl font-bold text-black text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {resource.jurisdiction} {resource.jurisdictionType === 'federal' ? '(Nationwide)' : 
                      resource.jurisdictionType === 'state' ? 'State Law' : 
                      resource.jurisdictionType === 'county' ? 'County Law' : 'City Law'}
                  </h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  resource.jurisdictionType === 'federal' ? 'bg-blue-100 text-blue-800' :
                  resource.jurisdictionType === 'state' ? 'bg-green-100 text-green-800' :
                  resource.jurisdictionType === 'county' ? 'bg-orange-100 text-orange-800' :
                  'bg-purple-100 text-purple-800'
                }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {resource.jurisdictionType.charAt(0).toUpperCase() + resource.jurisdictionType.slice(1)}
                </span>
              </div>
            </button>

            {/* Collapsible Content */}
            {isExpanded && (
              <div className="p-6 space-y-6">
            {/* Ban the Box Law Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5" style={{ color: '#E54747' }} />
                <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {resource.banTheBoxLaws.name}
                </h3>
              </div>
              <p className="text-sm mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                {resource.banTheBoxLaws.summary}
              </p>
              
              <button
                onClick={() => toggleSection(`provisions-${resource.jurisdiction}`)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}
              >
                {expandedSections[`provisions-${resource.jurisdiction}`] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                View Key Provisions
              </button>

              {expandedSections[`provisions-${resource.jurisdiction}`] && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                    <strong>Applies to:</strong> {resource.banTheBoxLaws.applies_to}
                  </p>
                  {resource.banTheBoxLaws.enacted && (
                    <p className="text-xs font-medium mb-3" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                      <strong>Enacted:</strong> {resource.banTheBoxLaws.enacted}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {resource.banTheBoxLaws.keyProvisions.map((provision, idx) => (
                      <li key={idx} className="flex gap-2 text-xs" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{provision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Timelines */}
            {(resource.timelines.backgroundCheckNotice || resource.timelines.adverseActionNotice || resource.timelines.rightToRespond) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5" style={{ color: '#E54747' }} />
                  <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Important Timelines
                  </h3>
                </div>
                <div className="space-y-2">
                  {resource.timelines.backgroundCheckNotice && (
                    <div className="flex gap-3 text-sm">
                      <div className="font-medium" style={{ color: '#000', fontFamily: 'Poppins, sans-serif', minWidth: '140px' }}>
                        Background Check:
                      </div>
                      <div style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        {resource.timelines.backgroundCheckNotice}
                      </div>
                    </div>
                  )}
                  {resource.timelines.adverseActionNotice && (
                    <div className="flex gap-3 text-sm">
                      <div className="font-medium" style={{ color: '#000', fontFamily: 'Poppins, sans-serif', minWidth: '140px' }}>
                        Adverse Action:
                      </div>
                      <div style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        {resource.timelines.adverseActionNotice}
                      </div>
                    </div>
                  )}
                  {resource.timelines.rightToRespond && (
                    <div className="flex gap-3 text-sm">
                      <div className="font-medium" style={{ color: '#000', fontFamily: 'Poppins, sans-serif', minWidth: '140px' }}>
                        Your Response Time:
                      </div>
                      <div style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        {resource.timelines.rightToRespond}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Government Agencies */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-5 w-5" style={{ color: '#E54747' }} />
                <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Government Agencies
                </h3>
              </div>
              <div className="space-y-4">
                {resource.governmentAgencies.map((agency, idx) => (
                  <div key={idx} className="p-4 border rounded-lg" style={{ borderColor: '#E5E5E5' }}>
                    <h4 className="font-semibold text-black mb-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {agency.name}
                    </h4>
                    <div className="space-y-1">
                      {agency.phone && (
                        <a href={`tel:${agency.phone}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                          <Phone className="h-3 w-3" />
                          {agency.phone}
                        </a>
                      )}
                      {agency.email && (
                        <a href={`mailto:${agency.email}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                          <Mail className="h-3 w-3" />
                          {agency.email}
                        </a>
                      )}
                      <a href={agency.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                        <Globe className="h-3 w-3" />
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {agency.filingInfo && (
                      <p className="mt-2 text-xs bg-blue-50 p-2 rounded" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                        <strong>Filing Information:</strong> {agency.filingInfo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Aid Organizations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5" style={{ color: '#E54747' }} />
                <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Free Legal Aid Organizations
                </h3>
              </div>
              <div className="space-y-4">
                {resource.legalAidOrganizations.map((org, idx) => (
                  <div key={idx} className="p-4 border rounded-lg" style={{ borderColor: '#E5E5E5' }}>
                    <h4 className="font-semibold text-black mb-2 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {org.name}
                    </h4>
                    <p className="text-xs mb-2" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                      {org.services}
                    </p>
                    <div className="space-y-1">
                      {org.phone && (
                        <a href={`tel:${org.phone}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                          <Phone className="h-3 w-3" />
                          {org.phone}
                        </a>
                      )}
                      {org.email && (
                        <a href={`mailto:${org.email}`} className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                          <Mail className="h-3 w-3" />
                          {org.email}
                        </a>
                      )}
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs hover:underline" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                        <Globe className="h-3 w-3" />
                        Visit Website <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Resources */}
            {resource.resources.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5" style={{ color: '#E54747' }} />
                  <h3 className="text-lg font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Additional Resources
                  </h3>
                </div>
                <div className="space-y-2">
                  {resource.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#E5E5E5' }}
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#E54747' }} />
                      <div>
                        <div className="font-medium text-sm mb-1" style={{ color: '#E54747', fontFamily: 'Poppins, sans-serif' }}>
                          {res.title}
                        </div>
                        <div className="text-xs" style={{ color: '#595959', fontFamily: 'Poppins, sans-serif' }}>
                          {res.description}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

