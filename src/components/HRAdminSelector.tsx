"use client";

import { supabase } from "@/lib/supabase";
import debounce from "lodash.debounce";
import { Building, Check, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface HRAdmin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
}

interface HRAdminSelectorProps {
  userId: string;
  selectedAdmins: string[];
  onAdminToggle: (adminId: string, isSelected: boolean) => void;
}

export default function HRAdminSelector({
  userId,
  selectedAdmins,
  onAdminToggle,
}: HRAdminSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hrAdmins, setHrAdmins] = useState<HRAdmin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<HRAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all HR admins on component mount
  useEffect(() => {
    fetchHRAdmins();
  }, []);

  const fetchHRAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("hr_admin_profiles")
        .select("id, email, first_name, last_name, company")
        .order("company", { ascending: true });

      if (error) throw error;
      setHrAdmins(data || []);
      setFilteredAdmins(data || []);
    } catch (err) {
      console.error("Error fetching HR admins:", err);
      setError("Failed to load HR admins");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredAdmins(hrAdmins);
        return;
      }

      const searchTerm = query.toLowerCase();
      const filtered = hrAdmins.filter(
        (admin) =>
          admin.first_name.toLowerCase().includes(searchTerm) ||
          admin.last_name.toLowerCase().includes(searchTerm) ||
          admin.email.toLowerCase().includes(searchTerm) ||
          admin.company.toLowerCase().includes(searchTerm)
      );
      setFilteredAdmins(filtered);
    }, 300),
    [hrAdmins]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Toggle admin selection
  const handleAdminToggle = (admin: HRAdmin) => {
    const isSelected = selectedAdmins.includes(admin.id);
    onAdminToggle(admin.id, !isSelected);
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search HR admins by name, email, or company..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilteredAdmins(hrAdmins);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading HR admins...
        </div>
      ) : (
        <>
          {/* Selected Admins Count and List are hidden for users */}
          {/* <div className="mb-4 text-sm text-gray-600">
            {selectedAdmins.length} HR admin
            {selectedAdmins.length !== 1 ? "s" : ""} selected
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? "No HR admins found matching your search"
                  : "No HR admins available"}
              </div>
            ) : (
              filteredAdmins.map((admin) => {
                const isSelected = selectedAdmins.includes(admin.id);
                // ...existing code for rendering each admin...
              })
            )}
          </div> */}
          {/* Only show search and selection UI */}
        </>
      )}
    </div>
  );
}
