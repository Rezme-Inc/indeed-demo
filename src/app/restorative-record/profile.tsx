import React from "react";

export default function RestorativeRecordProfile() {
  // Placeholder data structure for all categories
  // In real implementation, fetch from Supabase or context
  const user = {
    name: "Sam Finn",
    avatar: "/avatar-placeholder.png",
    about: "A committed ex-offender from San Francisco. I discovered my calling for software development while participating in Tech for Good...",
    social: [
      { type: "facebook", url: "#" },
      { type: "instagram", url: "#" },
      { type: "twitter", url: "#" },
      { type: "linkedin", url: "#" },
      { type: "github", url: "#" },
      { type: "website", url: "#" },
    ],
  };
  const achievements = [
    {
      id: 1,
      name: "Dean's List",
      type: "Academic Excellence",
      org: "City College of San Francisco",
      date: "2019-05-15",
      narrative: "This award recognized my academic achievement and commitment to excellence during my studies.",
      file: { name: "deanslist.pdf", url: "#", size: "100.0 KB" },
    },
  ];
  const skills = {
    soft: ["Communication", "Teamwork"],
    hard: ["Data Analysis", "Technical Writing"],
    other: "Fluent in Spanish",
    narrative: "This is a narrative for the skills section.",
    file: { name: "skills-certificate.pdf", url: "#", size: "50.0 KB" },
  };
  const engagements = [
    {
      id: 1,
      name: "Code for Change",
      type: "Volunteer Work",
      role: "Mentor",
      orgUrl: "https://codeforchange.org",
      details: "Mentored youth in coding basics.",
      file: { name: "volunteer.jpg", url: "#", size: "20.0 KB" },
    },
  ];
  const rehabPrograms = [
    {
      id: 1,
      name: "Mindfulness Coaching",
      details: "Completed mindfulness and wellness program.",
      narrative: "This program helped me learn to manage stress and improve my mental health.",
    },
  ];
  const certifications = [
    {
      id: 1,
      name: "Certificate of Ethical Conduct",
      org: "Tech for Good",
      issueDate: "2021-06-01",
      expiryDate: "2024-06-01",
      credentialId: "12345",
      credentialUrl: "https://certs.techforgood.org/12345",
      narrative: "This is a narrative for the certification.",
      file: { name: "ethics-cert.pdf", url: "#", size: "30.0 KB" },
    },
  ];
  const mentors = [
    {
      id: 1,
      name: "Mark Walsh",
      title: "Mentor",
      company: "Tech for Good",
      linkedin: "https://linkedin.com/in/markwalsh",
      email: "mark@example.com",
      phone: "555-123-4567",
      website: "https://markwalsh.com",
      narrative: "Mark provided invaluable guidance and support during my transition, helping me develop both technical and soft skills.",
    },
  ];
  const employments = [
    {
      id: 1,
      title: "Software Engineer",
      company: "Tech for Good",
      type: "Full-time",
      location: "San Francisco, CA",
      start: "2020-06-01",
      end: null,
      description: "Worked on social impact projects.",
      file: { name: "employment-proof.pdf", url: "#", size: "40.0 KB" },
    },
  ];
  const hobbies = {
    general: ["Reading", "Music"],
    sports: ["Soccer"],
    other: "Chess, Cooking",
    narrative: "This is a narrative for the hobbies section.",
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-0 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={user.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
          <div>
            <h1 className="text-2xl font-semibold text-black">{user.name}</h1>
            <div className="text-xs text-secondary tracking-wide">MY RESTORATIVE RECORD</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-black font-medium hover:bg-gray-50">Print</button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-black font-medium hover:bg-gray-50">Share</button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-black font-medium hover:bg-gray-50">Settings</button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-600">Legal Assistance</button>
        </div>
      </div>

      {/* About */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">About</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        <p className="text-secondary text-sm whitespace-pre-line">{user.about}</p>
      </section>

      {/* Social Media */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Social Media</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        <div className="flex gap-4">
          {user.social.map((s, i) => (
            <a key={i} href={s.url} className="text-secondary hover:text-primary" target="_blank" rel="noopener noreferrer">
              <span className={`icon-${s.type}`}></span>
            </a>
          ))}
        </div>
      </section>

      {/* Personal Achievements & Awards */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Personal Achievements & Awards</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {achievements.map((a) => (
          <div key={a.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{a.name}</div>
            <div className="text-sm text-secondary">Type: {a.type}</div>
            <div className="text-sm text-secondary">Organization: {a.org}</div>
            <div className="text-sm text-secondary">Date: {a.date}</div>
            <div className="text-sm text-secondary">Narrative: {a.narrative}</div>
            <a href={a.file.url} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{a.file.name}</a>
            <span className="text-xs text-secondary ml-1">{a.file.size}</span>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Skills</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        <div className="mb-2">
          <span className="text-secondary text-sm">Soft Skills:</span>
          {skills.soft.map((s, i) => (
            <span key={i} className="inline-block bg-primary/10 text-primary rounded px-2 py-1 text-xs ml-2 mb-1">{s}</span>
          ))}
        </div>
        <div className="mb-2">
          <span className="text-secondary text-sm">Hard Skills:</span>
          {skills.hard.map((s, i) => (
            <span key={i} className="inline-block bg-secondary/10 text-secondary rounded px-2 py-1 text-xs ml-2 mb-1">{s}</span>
          ))}
        </div>
        <div className="mb-2 text-secondary text-sm">Other: {skills.other}</div>
        <div className="mb-2 text-secondary text-sm">Narrative: {skills.narrative}</div>
        <a href={skills.file.url} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{skills.file.name}</a>
        <span className="text-xs text-secondary ml-1">{skills.file.size}</span>
      </section>

      {/* Community Engagement */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Community Engagement</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {engagements.map((e) => (
          <div key={e.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{e.name}</div>
            <div className="text-sm text-secondary">Type: {e.type}</div>
            <div className="text-sm text-secondary">Role: {e.role}</div>
            <a href={e.orgUrl} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{e.orgUrl}</a>
            <div className="text-sm text-secondary">Details: {e.details}</div>
            <a href={e.file.url} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{e.file.name}</a>
            <span className="text-xs text-secondary ml-1">{e.file.size}</span>
          </div>
        ))}
      </section>

      {/* Rehabilitative Programs */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Rehabilitative Programs</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {rehabPrograms.map((r) => (
          <div key={r.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{r.name}</div>
            <div className="text-sm text-secondary">{r.details}</div>
            <div className="text-sm text-secondary">Narrative: {r.narrative}</div>
          </div>
        ))}
      </section>

      {/* Certifications and Licenses */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Certifications and Licenses</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {certifications.map((c) => (
          <div key={c.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{c.name}</div>
            <div className="text-sm text-secondary">Organization: {c.org}</div>
            <div className="text-sm text-secondary">Issue Date: {c.issueDate}</div>
            <div className="text-sm text-secondary">Expiry Date: {c.expiryDate}</div>
            <div className="text-sm text-secondary">Credential ID: {c.credentialId}</div>
            <a href={c.credentialUrl} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{c.credentialUrl}</a>
            <div className="text-sm text-secondary">Narrative: {c.narrative}</div>
            <a href={c.file.url} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{c.file.name}</a>
            <span className="text-xs text-secondary ml-1">{c.file.size}</span>
          </div>
        ))}
      </section>

      {/* Mentors */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Mentors</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {mentors.map((m) => (
          <div key={m.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{m.name}</div>
            <div className="text-sm text-secondary">{m.title} • {m.company}</div>
            <a href={m.linkedin} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <div className="text-sm text-secondary">Email: {m.email}</div>
            <div className="text-sm text-secondary">Phone: {m.phone}</div>
            <a href={m.website} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{m.website}</a>
            <div className="text-sm text-secondary">Narrative: {m.narrative}</div>
          </div>
        ))}
      </section>

      {/* Employment History */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Employment History</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        {employments.map((e) => (
          <div key={e.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-2">
            <div className="font-semibold text-black">{e.title}</div>
            <div className="text-sm text-secondary">Company: {e.company}</div>
            <div className="text-sm text-secondary">Type: {e.type}</div>
            <div className="text-sm text-secondary">Location: {e.location}</div>
            <div className="text-sm text-secondary">{e.start} - {e.end ? e.end : "Present"}</div>
            <div className="text-sm text-secondary">Description: {e.description}</div>
            <a href={e.file.url} className="text-primary text-xs" target="_blank" rel="noopener noreferrer">{e.file.name}</a>
            <span className="text-xs text-secondary ml-1">{e.file.size}</span>
          </div>
        ))}
      </section>

      {/* Hobbies & Interests */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-black">Hobbies & Interests</h2>
          <button className="text-primary hover:text-red-600 font-medium text-sm">✎</button>
        </div>
        <div className="mb-2">
          <span className="text-secondary text-sm">General:</span>
          {hobbies.general.map((h, i) => (
            <span key={i} className="inline-block bg-green-100 text-green-700 rounded px-2 py-1 text-xs ml-2 mb-1">{h}</span>
          ))}
        </div>
        <div className="mb-2">
          <span className="text-secondary text-sm">Sports:</span>
          {hobbies.sports.map((s, i) => (
            <span key={i} className="inline-block bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs ml-2 mb-1">{s}</span>
          ))}
        </div>
        <div className="mb-2 text-secondary text-sm">Other: {hobbies.other}</div>
        <div className="mb-2 text-secondary text-sm">Narrative: {hobbies.narrative}</div>
      </section>
    </div>
  );
} 