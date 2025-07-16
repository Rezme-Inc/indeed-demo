"use client";

import HRAdminSelector from "@/components/HRAdminSelector";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function UserDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedHRAdmins, setSelectedHRAdmins] = useState<string[]>([]);
  const [currentHRPermissions, setCurrentHRPermissions] = useState<string[]>(
    []
  );

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

  const [wotcData, setWotcData] = useState({
    ssn: "",
    county: "",
    conditional_cert: false,
    tanf_9mo: false,
    vet_snap_3mo: false,
    voc_rehab: false,
    ticket_work: false,
    va: false,
    snap_6mo: false,
    snap_3of5: false,
    felony: false,
    ssi: false,
    vet_unemp_4_6: false,
    vet_unemp_6: false,
    vet_disab_discharged: false,
    vet_disab_unemp: false,
    tanf_18mo: false,
    tanf_18mo_since97: false,
    tanf_limit: false,
    unemp_27wks: false,
    signature: "",
    signature_date: "",
  });

  const tabList = ["personal", "contact", "wotc", "hr-permissions"];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeTabIndex = tabList.indexOf(activeTab);
    if (!scrollContainerRef.current || !tabRefs.current[activeTabIndex]) return;
    const container = scrollContainerRef.current;
    const tab = tabRefs.current[activeTabIndex];
    const scrollLeft =
      tab.offsetLeft -
      container.offsetLeft -
      container.clientWidth / 2 +
      tab.clientWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [activeTab]);

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
            .eq("id", user.id)
            .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }

      if (profileData) {
        setProfile(profileData);
        setProfileData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          date_of_birth: profileData.birthday || "",
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

      // Add debug logging for user and upsert payload
      console.log("Authenticated user object:", user);
      console.log("Upsert payload:", {
        id: user.id,
        email: user.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        birthday: profileData.date_of_birth || null,
        phone: profileData.phone || null,
        address_line1: profileData.address_line1 || null,
        address_line2: profileData.address_line2 || null,
        city: profileData.city || null,
        state: profileData.state || null,
        zip_code: profileData.zip_code || null,
        country: profileData.country || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      });

      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        email: user.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        birthday: profileData.date_of_birth || null,
        phone: profileData.phone || null,
        address_line1: profileData.address_line1 || null,
        address_line2: profileData.address_line2 || null,
        city: profileData.city || null,
        state: profileData.state || null,
        zip_code: profileData.zip_code || null,
        country: profileData.country || null,
        avatar_url: avatarUrl || null,
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

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
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
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSaveWotcSurvey() {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("wotc_surveys").upsert({
        user_id: user.id,
        ...wotcData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving WOTC survey:", error);
        alert("Error saving WOTC survey. Please try again.");
      } else {
        alert("WOTC survey saved successfully!");
      }
    } catch (error) {
      console.error("Error saving WOTC survey:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleWotcInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    let newValue: any = value;
    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      newValue = e.target.checked;
    }
    setWotcData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  async function fetchHRPermissions() {
    if (!user) return;

    try {
      const { data: permissions, error } = await supabase
        .from("user_hr_permissions")
        .select("hr_admin_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching HR permissions:", error);
        return;
      }

      const adminIds = permissions.map((p: { hr_admin_id: string }) => p.hr_admin_id);
      setSelectedHRAdmins(adminIds);
      setCurrentHRPermissions(adminIds);
    } catch (error) {
      console.error("Error fetching HR permissions:", error);
    }
  }

  async function handleHRAdminToggle(adminId: string, isSelected: boolean) {
    if (!user) return;

    try {
      if (isSelected) {
        // Grant permission
        const { error } = await supabase
          .from("user_hr_permissions")
          .insert({
            user_id: user.id,
            hr_admin_id: adminId,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error granting permission:", error);
          return;
        }

        setSelectedHRAdmins((prev) => [...prev, adminId]);
      } else {
        // Revoke permission
        const { error } = await supabase
          .from("user_hr_permissions")
          .delete()
          .eq("user_id", user.id)
          .eq("hr_admin_id", adminId);

        if (error) {
          console.error("Error revoking permission:", error);
          return;
        }

        setSelectedHRAdmins((prev) => prev.filter((id) => id !== adminId));
      }
    } catch (error) {
      console.error("Error toggling HR admin permission:", error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchHRPermissions();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={
                    avatarPreview ||
                    `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&background=E54747&color=fff`
                  }
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
            <button
              onClick={handleSignOut}
              className="px-5 py-2 text-base font-medium rounded-xl shadow hover:opacity-90 border md:ml-auto"
              style={{ color: '#E54747', backgroundColor: '#FFFFFF', borderColor: '#E54747' }}
            >
              Sign Out
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-200 relative">
          <div
            className="w-full overflow-x-auto hide-scrollbar"
            ref={scrollContainerRef}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <nav
              className="flex w-max space-x-4 sm:space-x-8 px-2 sm:px-6 whitespace-nowrap"
              aria-label="Tabs"
            >
              {tabList.map((tab, idx) => (
                <button
                  key={tab}
                  ref={el => { tabRefs.current[idx] = el; }}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-secondary hover:text-black hover:border-gray-300"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                  {tab === "personal"
                    ? "Info"
                    : tab === "contact"
                      ? "Info"
                      : tab === "privacy"
                        ? "Settings"
                        : "HR Access"}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Personal Information
                </h3>
                <p className="text-secondary mb-6">
                  Update your personal information and profile settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={profileData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  {avatarPreview && (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-red-600"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-3">Email Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={profileData.email_notifications}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Receive email notifications
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="marketing_emails"
                      checked={profileData.marketing_emails}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Receive marketing emails
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="security_alerts"
                      checked={profileData.security_alerts}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Receive security alerts
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Contact Information
                </h3>
                <p className="text-secondary mb-6">
                  Update your address and contact details.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={profileData.address_line1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    value={profileData.address_line2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profileData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={profileData.zip_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profileData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "wotc" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Work Opportunity Tax Credit (WOTC) Survey
                </h3>
                <p className="text-secondary mb-6">
                  Please complete this survey to help determine if you qualify
                  for the Work Opportunity Tax Credit.
                </p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveWotcSurvey(); }}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Social Security Number
                      </label>
                      <input
                        type="text"
                        name="ssn"
                        value={wotcData.ssn}
                        onChange={handleWotcInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        County
                      </label>
                      <input
                        type="text"
                        name="county"
                        value={wotcData.county}
                        onChange={handleWotcInputChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-black">Target Groups</h4>
                    <p className="text-sm text-secondary">
                      Please check all that apply to you:
                    </p>

                    <div className="space-y-3">
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="conditional_cert"
                          checked={wotcData.conditional_cert}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a member of a family that received assistance from
                        the Temporary Assistance for Needy Families (TANF)
                        program for any 9 months during the past 18 months.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="tanf_9mo"
                          checked={wotcData.tanf_9mo}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a member of a family that received assistance from
                        the Temporary Assistance for Needy Families (TANF)
                        program for any 9 months during the past 18 months.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="vet_snap_3mo"
                          checked={wotcData.vet_snap_3mo}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is a member of a family that received
                        assistance from the Supplemental Nutrition Assistance
                        Program (SNAP) for at least 3 months during the past 15
                        months.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="voc_rehab"
                          checked={wotcData.voc_rehab}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is entitled to compensation for a
                        service-connected disability and was discharged or
                        released from active duty in the U.S. Armed Forces in
                        the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="ticket_work"
                          checked={wotcData.ticket_work}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is entitled to compensation for a
                        service-connected disability and was discharged or
                        released from active duty in the U.S. Armed Forces in
                        the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="va"
                          checked={wotcData.va}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is entitled to compensation for a
                        service-connected disability and was discharged or
                        released from active duty in the U.S. Armed Forces in
                        the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="snap_6mo"
                          checked={wotcData.snap_6mo}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a member of a family that received assistance from
                        the Supplemental Nutrition Assistance Program (SNAP) for
                        at least 6 months during the past 15 months.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="snap_3of5"
                          checked={wotcData.snap_3of5}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a member of a family that received assistance from
                        the Supplemental Nutrition Assistance Program (SNAP) for
                        at least 3 months during the past 15 months.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="felony"
                          checked={wotcData.felony}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I was convicted of a felony and was released from
                        prison in the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="ssi"
                          checked={wotcData.ssi}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a member of a family that received assistance from
                        the Supplemental Security Income (SSI) program for any
                        month during the past 60 days.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="vet_unemp_4_6"
                          checked={wotcData.vet_unemp_4_6}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is entitled to compensation for a
                        service-connected disability and was discharged or
                        released from active duty in the U.S. Armed Forces in
                        the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="vet_unemp_6"
                          checked={wotcData.vet_unemp_6}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran who is entitled to compensation for a
                        service-connected disability and was discharged or
                        released from active duty in the U.S. Armed Forces in
                        the past year.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="vet_disab_discharged"
                          checked={wotcData.vet_disab_discharged}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I am a veteran with a service-connected disability who
                        was:
                      </label>
                      <div className="pl-6 space-y-1">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            name="vet_disab_unemp"
                            checked={wotcData.vet_disab_unemp}
                            onChange={handleWotcInputChange}
                            className="mt-1"
                          />
                          Discharged or released from active duty in the U.S.
                          Armed Forces in the past year, OR
                        </label>
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            name="tanf_18mo"
                            checked={wotcData.tanf_18mo}
                            onChange={handleWotcInputChange}
                            className="mt-1"
                          />
                          Unemployed for at least 6 months in the past year.
                        </label>
                      </div>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="tanf_18mo_since97"
                          checked={wotcData.tanf_18mo_since97}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        Received TANF for any 18 months after August 5, 1997,
                        and the earliest 18-month period ended during the past 2
                        years, OR
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="tanf_limit"
                          checked={wotcData.tanf_limit}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        Stopped being eligible for TANF payments in the past 2
                        years due to a federal/state time limit.
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="unemp_27wks"
                          checked={wotcData.unemp_27wks}
                          onChange={handleWotcInputChange}
                          className="mt-1"
                        />
                        I have been unemployed for at least 27 consecutive
                        weeks, and I received unemployment compensation during
                        all or part of that time.
                      </label>
                    </div>
                  </div>
                  <div className="mt-8 border-t pt-6">
                    <h4 className="font-semibold mb-2">
                      Certification by Applicant
                    </h4>
                    <p className="mb-2 text-sm">
                      Under penalties of perjury, I certify that I provided this
                      information to my employer on or before the day I was
                      offered a job, and that it is true and complete to the
                      best of my knowledge.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Signature
                        </label>
                        <input
                          type="text"
                          name="signature"
                          value={wotcData.signature}
                          onChange={handleWotcInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="signature_date"
                          value={wotcData.signature_date}
                          onChange={handleWotcInputChange}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Saving..." : "Save WOTC Survey"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "hr-permissions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  Manage HR Admin Access
                </h3>
                <p className="text-secondary mb-6">
                  Control which HR administrators can view your restorative
                  record. You can grant or revoke access at any time.
                </p>

                {user && (
                  <HRAdminSelector
                    userId={user.id}
                    selectedAdmins={selectedHRAdmins}
                    onAdminToggle={handleHRAdminToggle}
                  />
                )}

                {selectedHRAdmins.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> The selected HR administrators
                      will be able to view your restorative record when you
                      appear on their dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          {(activeTab === "personal" || activeTab === "contact") && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
    </main>
  );
} 