import { useState, useMemo } from "react";
import { getProfiles } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProfileCard from "@/components/ProfileCard";
import { Search } from "lucide-react";

export default function Sangam() {
  const { t, lang } = useLang();
  const profiles = getProfiles().filter(p => p.approved !== false && p.id !== "admin");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Get unique locations from profiles
  const locations = useMemo(() => {
    const locSet = new Set(profiles.map(p => p.district || p.city).filter(Boolean));
    return Array.from(locSet).sort();
  }, [profiles]);

  // Filter profiles by selected location
  const filteredProfiles = useMemo(() => {
    if (!selectedLocation) return profiles;
    return profiles.filter(p => 
      (p.district === selectedLocation || p.city === selectedLocation) && 
      p.showContact !== false
    );
  }, [selectedLocation, profiles]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {lang === "en" ? "Sattiyar Sangam" : "சத்தியர் சங்கம்"}
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl">
            {lang === "en" 
              ? "Connect with Sattiyar community members from your location. Browse verified profiles and find like-minded individuals."
              : "உங்கள் பகுதியில் இருந்து சத்தியர் சமூக உறுப்பினர்களுடன் இணையுங்கள்."
            }
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b sticky top-[70px] z-40 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">
                {lang === "en" ? "Select Location/District" : "இடத்தைத் தேர்ந்தெடுக்கவும்"}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">
                  {lang === "en" ? "All Locations" : "அனைத்து இடங்களும்"}
                </option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-muted-foreground">
              {lang === "en" 
                ? `Found ${filteredProfiles.length} member${filteredProfiles.length !== 1 ? 's' : ''}`
                : `${filteredProfiles.length} உறுப்பினர்கள் கிடைத்தனர்`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        {filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {lang === "en" ? "No members found" : "உறுப்பினர்கள் கிடைக்கவில்லை"}
            </h3>
            <p className="text-muted-foreground max-w-sm text-center">
              {lang === "en"
                ? "Try selecting a different location or check back later as more members join."
                : "வேறு இடத்தைத் தேர்ந்தெடுக்கவும் அல்லது பின்னர் மீண்டும் பார்க்கவும்."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-primary/10 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {profiles.length}+
              </div>
              <p className="text-foreground">
                {lang === "en" ? "Active Members" : "சক்திவாய்ந்த உறுப்பினர்கள்"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {locations.length}
              </div>
              <p className="text-foreground">
                {lang === "en" ? "Locations" : "இடங்கள்"}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                100%
              </div>
              <p className="text-foreground">
                {lang === "en" ? "Verified" : "சரிபார்க்கப்பட்ட"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
