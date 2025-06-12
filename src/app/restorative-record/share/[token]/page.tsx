'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import { UserProfile } from '@/types/user';

const socialFields = [
  { name: "facebookUrl", label: "Facebook" },
  { name: "linkedinUrl", label: "LinkedIn" },
  { name: "redditUrl", label: "Reddit" },
  { name: "digitalPortfolioUrl", label: "Digital Portfolio" },
  { name: "instagramUrl", label: "Instagram" },
  { name: "githubUrl", label: "GitHub" },
  { name: "tiktokUrl", label: "TikTok" },
  { name: "pinterestUrl", label: "Pinterest" },
  { name: "twitterUrl", label: "Twitter" },
  { name: "personalWebsiteUrl", label: "Personal Website" },
  { name: "handshakeUrl", label: "Handshake" },
];

export default function SharedRestorativeRecord() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const supabase = createClientComponentClient();

  // State for all restorative record data
  const [introduction, setIntroduction] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [communityEngagements, setCommunityEngagements] = useState<any[]>([]);
  const [rehabPrograms, setRehabPrograms] = useState<any[]>([]);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [employments, setEmployments] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSharedProfile() {
      try {
        console.log("🔍 Fetching profile for token:", params.token);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('share_token', params.token)
          .single();

        console.log("📊 Profile query result:", { data, error });

        if (error) {
          console.error("❌ Profile fetch error:", error);
          throw error;
        }
        if (!data) {
          console.error("❌ No profile found for token:", params.token);
          throw new Error('Profile not found');
        }

        console.log("✅ Profile found:", data);
        setProfile(data);

        // Fetch all restorative record data
        await fetchRestorativeRecordData(data.id);
      } catch (err) {
        console.error("💥 Error in fetchSharedProfile:", err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    async function fetchRestorativeRecordData(userId: string) {
      try {
        console.log("🔄 Fetching restorative record data for user:", userId);
        
        // Test the user exists and has a share token
        const { data: profileCheck, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, share_token")
          .eq("id", userId)
          .single();
        
        console.log("👤 Profile check result:", { profileCheck, profileError });
        
        // Fetch introduction
        console.log("📝 Fetching introduction...");
        const { data: introData, error: introError } = await supabase
          .from("introduction")
          .select("*")
          .eq("user_id", userId)
          .single();
        
        console.log("📝 Introduction result:", { 
          data: introData, 
          error: introError,
          message: introError?.message 
        });
        
        if (introError && introError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error("❌ Introduction error:", introError);
        }
        setIntroduction(introData);

        // Fetch awards/achievements
        console.log("🏆 Fetching awards...");
        const { data: awardsData, error: awardsError } = await supabase
          .from("awards")
          .select("*")
          .eq("user_id", userId);
        
        console.log("🏆 Awards result:", { 
          data: awardsData, 
          count: awardsData?.length,
          error: awardsError
        });
        
        if (awardsError) {
          console.error("❌ Awards error:", awardsError);
        }
        setAchievements(awardsData || []);

        // Fetch skills
        console.log("💪 Fetching skills...");
        const { data: skillsData, error: skillsError } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", userId);
        
        console.log("💪 Skills result:", { 
          data: skillsData, 
          count: skillsData?.length,
          error: skillsError
        });
        
        if (skillsError) {
          console.error("❌ Skills error:", skillsError);
        }
        setSkills(skillsData || []);

        // Test one more specific query to debug RLS
        console.log("🧪 Testing direct skills query...");
        const { data: testSkills, error: testSkillsError } = await supabase
          .from("skills")
          .select("id, user_id, soft_skills, hard_skills")
          .eq("id", "23ec0afe-25e1-416f-947c-24ceccdb9d80");
        
        console.log("🧪 Test skills result:", { 
          data: testSkills, 
          error: testSkillsError
        });

        // Continue with other tables...
        console.log("🤝 Fetching community engagements...");
        const { data: engagementData, error: engagementError } = await supabase
          .from("community_engagements")
          .select("*")
          .eq("user_id", userId);
        if (engagementError) console.error("Community engagements error:", engagementError);
        setCommunityEngagements(engagementData || []);

        console.log("🏥 Fetching rehab programs...");
        const { data: rehabData, error: rehabError } = await supabase
          .from("rehab_programs")
          .select("*")
          .eq("user_id", userId);
        if (rehabError) console.error("Rehab programs error:", rehabError);
        setRehabPrograms(rehabData || []);

        console.log("🎯 Fetching hobbies...");
        const { data: hobbiesData, error: hobbiesError } = await supabase
          .from("hobbies")
          .select("*")
          .eq("user_id", userId);
        if (hobbiesError) console.error("Hobbies error:", hobbiesError);
        setHobbies(hobbiesData || []);

        console.log("📜 Fetching certifications...");
        const { data: certsData, error: certsError } = await supabase
          .from("micro_credentials")
          .select("*")
          .eq("user_id", userId);
        if (certsError) console.error("Certifications error:", certsError);
        setCertifications(certsData || []);

        console.log("👨‍🏫 Fetching mentors...");
        const { data: mentorsData, error: mentorsError } = await supabase
          .from("mentors")
          .select("*")
          .eq("user_id", userId);
        if (mentorsError) console.error("Mentors error:", mentorsError);
        setMentors(mentorsData || []);

        console.log("💼 Fetching employment...");
        const { data: employmentData, error: employmentError } = await supabase
          .from("employment")
          .select("*")
          .eq("user_id", userId);
        if (employmentError) console.error("Employment error:", employmentError);
        setEmployments(employmentData || []);

        console.log("🎓 Fetching education...");
        const { data: educationData, error: educationError } = await supabase
          .from("education")
          .select("*")
          .eq("user_id", userId);
        if (educationError) console.error("Education error:", educationError);
        setEducation(educationData || []);
        
        console.log("✅ Final data summary:", {
          introduction: introData ? "found" : "null",
          awards: awardsData?.length || 0,
          skills: skillsData?.length || 0,
          engagements: engagementData?.length || 0,
          rehab: rehabData?.length || 0,
          hobbies: hobbiesData?.length || 0,
          certs: certsData?.length || 0,
          mentors: mentorsData?.length || 0,
          employment: employmentData?.length || 0,
          education: educationData?.length || 0
        });
      } catch (err) {
        console.error("💥 Error fetching restorative record data:", err);
      }
    }

    fetchSharedProfile();
  }, [params.token, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-600">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white py-10 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="text-gray-600">
            <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
            <p>The shared profile could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restorative Record</h1>
            <p className="text-gray-600">Shared Profile</p>
          </div>
        </div>

        {/* Profile Header */}
        <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-600">
                {profile?.first_name?.[0] || "U"}
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1">
                {profile?.first_name || ""} {profile?.last_name || ""}
              </div>
              {introduction && (
                <>
                  <div className="text-gray-600 mb-2">
                    {introduction.preferred_occupation || "Professional"} |{" "}
                    {introduction.language_proficiency || "English"}
                    {introduction.other_languages &&
                      introduction.other_languages.length > 0 &&
                      ` | ${introduction.other_languages.join(", ")}`}
                  </div>
                  <div className="mb-2 text-black">
                    {introduction.personal_narrative ||
                      "No narrative provided yet."}
                  </div>
                  {/* Social Media Links */}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {socialFields.map((field) => {
                      const dbField = field.name.replace(/Url$/, "_url").replace(/([A-Z])/g, "_$1").toLowerCase();
                      const url = introduction[dbField] || introduction[field.name] || "";
                      if (!url) return null;
                      return (
                        <a
                          key={field.name}
                          href={url}
                          className="text-blue-500 underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={field.label}
                        >
                          {field.label}
                        </a>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Personal Achievements & Awards */}
        {achievements.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Personal Achievements & Awards</h2>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{achievement.name}</div>
                  <div className="text-sm text-gray-600 mt-1">Type: {achievement.type}</div>
                  <div className="text-sm text-gray-600">Organization: {achievement.organization}</div>
                  {achievement.date && (
                    <div className="text-sm text-gray-600">Date: {new Date(achievement.date).toLocaleDateString()}</div>
                  )}
                  {achievement.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{achievement.narrative}</div>
                  )}
                  {achievement.file_url && (
                    <a 
                      href={achievement.file_url} 
                      className="text-blue-500 text-xs mt-2 inline-block" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Skills</h2>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {skill.soft_skills && skill.soft_skills.length > 0 && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm font-medium">Soft Skills: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skill.soft_skills.map((skillItem: string, index: number) => (
                          <span key={index} className="inline-block bg-green-100 text-green-700 rounded px-2 py-1 text-xs">
                            {skillItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skill.hard_skills && skill.hard_skills.length > 0 && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm font-medium">Hard Skills: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {skill.hard_skills.map((skillItem: string, index: number) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs">
                            {skillItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skill.other_skills && (
                    <div className="mb-2 text-sm text-gray-600">Other Skills: {skill.other_skills}</div>
                  )}
                  {skill.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{skill.narrative}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community Engagement */}
        {communityEngagements.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Community Engagement</h2>
            <div className="space-y-4">
              {communityEngagements.map((engagement) => (
                <div key={engagement.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{engagement.organization_name}</div>
                  <div className="text-sm text-gray-600 mt-1">Type: {engagement.type}</div>
                  <div className="text-sm text-gray-600">Role: {engagement.role}</div>
                  {engagement.organization_website && (
                    <a href={engagement.organization_website} className="text-blue-500 text-xs" target="_blank" rel="noopener noreferrer">
                      {engagement.organization_website}
                    </a>
                  )}
                  {engagement.details && (
                    <div className="text-sm text-gray-700 mt-2">{engagement.details}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rehabilitative Programs */}
        {rehabPrograms.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Rehabilitative Programs</h2>
            <div className="space-y-4">
              {rehabPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{program.program}</div>
                  <div className="text-sm text-gray-600 mt-1">Type: {program.program_type}</div>
                  {(program.start_date || program.end_date) && (
                    <div className="text-sm text-gray-600">
                      {program.start_date && `Started: ${new Date(program.start_date).toLocaleDateString()}`}
                      {program.start_date && program.end_date && " • "}
                      {program.end_date && `Ended: ${new Date(program.end_date).toLocaleDateString()}`}
                    </div>
                  )}
                  {program.details && (
                    <div className="text-sm text-gray-600 mt-1">{program.details}</div>
                  )}
                  {program.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{program.narrative}</div>
                  )}
                  {program.file_url && (
                    <div className="text-sm mt-4 pt-3 border-t border-gray-100">
                      <a
                        href={program.file_url}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {program.file_name || "View attachment"}
                        {program.file_size && (
                          <span className="ml-2 text-gray-500">
                            ({Math.round(program.file_size / 1024)} KB)
                          </span>
                        )}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications and Licenses */}
        {certifications.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Certifications and Licenses</h2>
            <div className="space-y-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{cert.credential_name}</div>
                  <div className="text-sm text-gray-600 mt-1">Organization: {cert.issuing_organization}</div>
                  {cert.issue_date && (
                    <div className="text-sm text-gray-600">Issue Date: {new Date(cert.issue_date).toLocaleDateString()}</div>
                  )}
                  {cert.expiry_date && (
                    <div className="text-sm text-gray-600">Expiry Date: {new Date(cert.expiry_date).toLocaleDateString()}</div>
                  )}
                  {cert.credential_id && (
                    <div className="text-sm text-gray-600">Credential ID: {cert.credential_id}</div>
                  )}
                  {cert.credential_url && (
                    <a href={cert.credential_url} className="text-blue-500 text-xs" target="_blank" rel="noopener noreferrer">
                      View Credential
                    </a>
                  )}
                  {cert.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{cert.narrative}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mentors */}
        {mentors.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Mentors</h2>
            <div className="space-y-4">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{mentor.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{mentor.title} • {mentor.company}</div>
                  {mentor.linkedin_profile && (
                    <a href={mentor.linkedin_profile} className="text-blue-500 text-xs" target="_blank" rel="noopener noreferrer">
                      LinkedIn Profile
                    </a>
                  )}
                  {mentor.email && (
                    <div className="text-sm text-gray-600">Email: {mentor.email}</div>
                  )}
                  {mentor.phone && (
                    <div className="text-sm text-gray-600">Phone: {mentor.phone}</div>
                  )}
                  {mentor.website && (
                    <a href={mentor.website} className="text-blue-500 text-xs" target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  )}
                  {mentor.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{mentor.narrative}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Employment History */}
        {employments.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Employment History</h2>
            <div className="space-y-4">
              {employments.map((employment) => (
                <div key={employment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{employment.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{employment.company}</div>
                  <div className="text-sm text-gray-600">{employment.employment_type} • {employment.city}, {employment.state}</div>
                  <div className="text-sm text-gray-600">
                    {employment.start_date && new Date(employment.start_date).toLocaleDateString()} - {
                      employment.currently_employed ? "Present" : 
                      employment.end_date ? new Date(employment.end_date).toLocaleDateString() : "N/A"
                    }
                  </div>
                  {employment.company_url && (
                    <a href={employment.company_url} className="text-blue-500 text-xs" target="_blank" rel="noopener noreferrer">
                      Company Website
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold text-black">{edu.school_name}</div>
                  <div className="text-sm text-gray-600 mt-1">{edu.degree} in {edu.field_of_study}</div>
                  <div className="text-sm text-gray-600">{edu.school_location}</div>
                  <div className="text-sm text-gray-600">
                    {edu.start_date && new Date(edu.start_date).toLocaleDateString()} - {
                      edu.currently_enrolled ? "Present" : 
                      edu.end_date ? new Date(edu.end_date).toLocaleDateString() : "N/A"
                    }
                  </div>
                  {edu.grade && (
                    <div className="text-sm text-gray-600">Grade: {edu.grade}</div>
                  )}
                  {edu.description && (
                    <div className="text-sm text-gray-700 mt-2">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies & Interests */}
        {hobbies.length > 0 && (
          <section className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Hobbies & Interests</h2>
            <div className="space-y-4">
              {hobbies.map((hobby) => (
                <div key={hobby.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {hobby.general_hobby && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm font-medium">General Hobbies: </span>
                      <span className="text-sm text-gray-700">{hobby.general_hobby}</span>
                    </div>
                  )}
                  {hobby.sports && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm font-medium">Sports: </span>
                      <span className="text-sm text-gray-700">{hobby.sports}</span>
                    </div>
                  )}
                  {hobby.other_interests && (
                    <div className="mb-2">
                      <span className="text-gray-600 text-sm font-medium">Other Interests: </span>
                      <span className="text-sm text-gray-700">{hobby.other_interests}</span>
                    </div>
                  )}
                  {hobby.narrative && (
                    <div className="text-sm text-gray-700 mt-2">{hobby.narrative}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
} 