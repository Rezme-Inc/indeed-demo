"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    address: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
    email_notifications: true,
    marketing_emails: false,
    security_alerts: true,
    avatar_url: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push("/auth/user/login");
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }

      if (profileData) {
        setProfile(profileData);
        setProfileData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          date_of_birth: profileData.date_of_birth || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          address_line1: profileData.address_line1 || profileData.address || "",
          address_line2: profileData.address_line2 || "",
          city: profileData.city || "",
          state: profileData.state || "",
          zip_code: profileData.zip_code || "",
          country: profileData.country || "",
          email_notifications: profileData.email_notifications ?? true,
          marketing_emails: profileData.marketing_emails ?? false,
          security_alerts: profileData.security_alerts ?? true,
          avatar_url: profileData.avatar_url || "",
        });
        if (profileData.avatar_url) {
          setAvatarPreview(profileData.avatar_url);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
      router.push("/auth/user/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!user) return;
    setSaving(true);

    try {
      let avatarUrl = profileData.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          alert("Error uploading avatar. Please try again.");
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);
        avatarUrl = publicUrl;
      }

      const { error } = await supabase.from("user_profiles").upsert({
        user_id: user.id,
        ...profileData,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving profile:", error);
        alert("Error saving profile. Please try again.");
      } else {
        alert("Profile saved successfully!");
        setProfileData((prev) => ({ ...prev, avatar_url: avatarUrl }));
        setAvatarFile(null);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let newValue: any = value;
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      newValue = e.target.checked;
    }
    setProfileData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/restorative-record")}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                To Restorative Record
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-secondary hover:text-black font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={avatarPreview || `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&background=E54747&color=fff`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors">
                  <span className="text-sm">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black">
                  {profileData.first_name || profileData.last_name
                    ? `${profileData.first_name} ${profileData.last_name}`
                    : "Welcome!"}
                </h2>
                <p className="text-secondary">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {["personal", "contact", "privacy"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-black hover:border-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "personal" ? "Info" : tab === "contact" ? "Info" : "Settings"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={profileData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={profileData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none text-gray-400 cursor-not-allowed"
                      placeholder="jodi@rezme.app"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="(000) 000-0000"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_line1"
                      value={profileData.address_line1 || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter address line 1"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="address_line2"
                      value={profileData.address_line2 || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter address line 2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={profileData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      {/* Add all states as needed */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Zip code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={profileData.zip_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-100 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Zip code"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <form className="space-y-6">
                  <h3 className="text-lg font-semibold text-black mb-4">WOTC Pre-Screening Survey</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                      <input type="text" name="wotc_full_name" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Social Security Number (SSN)</label>
                      <input type="text" name="wotc_ssn" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Street Address</label>
                      <input type="text" name="wotc_address" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">City, State, ZIP Code</label>
                      <input type="text" name="wotc_city_state_zip" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">County</label>
                      <input type="text" name="wotc_county" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Phone Number</label>
                      <input type="text" name="wotc_phone" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Date of Birth (if under 40)</label>
                      <input type="text" name="wotc_dob" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Please check any of the following statements that apply to you. You may check more than one box.</p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_conditional_cert" className="mt-1" />I received a Conditional Certification (ETA Form 9062) from a state or local workforce agency for the Work Opportunity Tax Credit.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_tanf_9mo" className="mt-1" />I am a member of a family that received TANF (Temporary Assistance for Needy Families) for any 9 months during the past 18 months.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_snap_3mo" className="mt-1" />I am a veteran and a member of a family that received SNAP (food stamps) for at least 3 months during the past 15 months.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_referred" className="mt-1" />I was referred to this job by:</label>
                      <div className="pl-6 space-y-1">
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_voc_rehab" className="mt-1" />A state-certified vocational rehabilitation agency,</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_ticket_work" className="mt-1" />An employment network under the Ticket to Work program, or</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_va" className="mt-1" />The Department of Veterans Affairs.</label>
                      </div>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_snap_18_40" className="mt-1" />I am 18 or older but not yet 40, and a member of a family that:</label>
                      <div className="pl-6 space-y-1">
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_snap_6mo" className="mt-1" />Received SNAP benefits for the past 6 months, OR</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_snap_3of5" className="mt-1" />Received SNAP benefits for at least 3 of the past 5 months but is no longer eligible.</label>
                      </div>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_felony" className="mt-1" />I was convicted of a felony or released from prison for a felony during the past year.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_ssi" className="mt-1" />I received Supplemental Security Income (SSI) benefits during any month in the past 60 days.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_unemp_4_6" className="mt-1" />I am a veteran who was unemployed for at least 4 weeks but less than 6 months in the past year.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_unemp_6" className="mt-1" />I am a veteran who was unemployed for at least 6 months in the past year.</label>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_disab" className="mt-1" />I am a veteran with a service-connected disability who was:</label>
                      <div className="pl-6 space-y-1">
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_disab_discharged" className="mt-1" />Discharged or released from active duty in the U.S. Armed Forces in the past year, OR</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_vet_disab_unemp" className="mt-1" />Unemployed for at least 6 months in the past year.</label>
                      </div>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_tanf_family" className="mt-1" />I am a member of a family that:</label>
                      <div className="pl-6 space-y-1">
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_tanf_18mo" className="mt-1" />Received TANF payments for at least the past 18 months, OR</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_tanf_18mo_since97" className="mt-1" />Received TANF for any 18 months after August 5, 1997, and the earliest 18-month period ended during the past 2 years, OR</label>
                        <label className="flex items-start gap-2"><input type="checkbox" name="wotc_tanf_limit" className="mt-1" />Stopped being eligible for TANF payments in the past 2 years due to a federal/state time limit.</label>
                      </div>
                      <label className="flex items-start gap-2"><input type="checkbox" name="wotc_unemp_27wks" className="mt-1" />I have been unemployed for at least 27 consecutive weeks, and I received unemployment compensation during all or part of that time.</label>
                    </div>
                  </div>
                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-semibold mb-2">Certification by Applicant</h4>
                    <p className="mb-2 text-sm">Under penalties of perjury, I certify that I provided this information to my employer on or before the day I was offered a job, and that it is true and complete to the best of my knowledge.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Signature</label>
                        <input type="text" name="wotc_signature" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Date</label>
                        <input type="date" name="wotc_date" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
