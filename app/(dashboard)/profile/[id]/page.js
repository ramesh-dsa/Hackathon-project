"use client";

import { use, useState, useRef } from "react";
import { useUser } from "../../../../lib/user-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import { Rating } from "../../../../components/ui/rating";
import { Modal } from "../../../../components/ui/modal";
import { MapPin, Calendar, Clock, Globe, MessageSquare, Share2, CheckCircle2, Pencil } from "lucide-react";

const AVAILABLE_LANGUAGES = [
  "English", "Tamil", "Hindi", "Telugu", "Malayalam", 
  "Kannada", "Spanish", "French", "German", "Mandarin", "Japanese"
];

export default function ProfilePage({ params }) {
  const { id } = use(params);
  const { allUsers, sendRequest, currentUser, requests, updateProfile } = useUser();
  const user = allUsers.find(u => u.id === id) || allUsers[0];

  const isCurrentUser = !!(currentUser && user && user.id === currentUser.id);
  const hasSentRequest = (requests?.sent || []).some(r => r.user?.id === user?.id && r.status === 'pending');

  const [activeTab, setActiveTab] = useState("overview");
  
  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [offering, setOffering] = useState((currentUser?.offers || [])[0] || "");
  const [wanting, setWanting] = useState((user?.offers || [])[0] || "");

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    location: user.location || "",
    bio: user.bio || "",
    languages: user.languages || [],
    availability: user.availability || ""
  });

  // Image Edit State
  const [imageEditType, setImageEditType] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (imageEditType === 'cover') {
          updateProfile({ coverImage: reader.result });
        } else if (imageEditType === 'avatar') {
          updateProfile({ avatar: reader.result });
        }
        setImageEditType(null);
      };
      reader.readAsDataURL(file);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const handleRequestExchange = (e) => {
    e.preventDefault();
    if (offering && wanting) {
      sendRequest(user, offering, wanting);
      setIsRequestModalOpen(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name: editForm.name,
      location: editForm.location,
      bio: editForm.bio,
      languages: editForm.languages,
      availability: editForm.availability
    });
    setIsEditModalOpen(false);
  };

  // Guard: if user not found yet (still loading), show spinner
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-background">
      {/* Cover Image */}
      <div 
        className="w-full h-48 md:h-64 bg-surface-card bg-cover bg-center border-b border-border relative"
        style={{ backgroundImage: `url(${user.coverImage || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        {isCurrentUser && (
          <button 
            onClick={() => { setImageEditType('cover'); fileInputRef.current?.click(); }}
            className="absolute top-4 right-4 md:top-6 md:right-8 bg-surface border border-border text-foreground p-2 md:p-2.5 rounded-full shadow-sm hover:bg-surface-hover transition-colors z-10"
            title="Edit cover image"
          >
            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        )}
      </div>

      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar - GitHub Inspired (No Card, Left Aligned) */}
          <div className="w-full md:w-[320px] flex-shrink-0 -mt-16 md:-mt-20 relative z-20">
            <div className="relative inline-block">
              <Avatar 
                src={user.avatar} 
                alt={user.name} 
                className="w-32 h-32 md:w-48 md:h-48 border-4 border-background bg-surface-card shadow-lg rounded-full object-cover" 
              />
              {user.verified && !isCurrentUser && (
                <div className="absolute bottom-4 right-4 bg-background rounded-full p-0.5" title="Verified Member">
                  <CheckCircle2 className="w-8 h-8 text-green-500" fill="currentColor" stroke="var(--background)" strokeWidth={2} />
                </div>
              )}
              {isCurrentUser && (
                <button
                  onClick={() => { setImageEditType('avatar'); fileInputRef.current?.click(); }}
                  className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-surface border border-border text-foreground p-2 md:p-2.5 rounded-full shadow-md hover:bg-surface-hover transition-colors z-10"
                  title="Edit profile picture"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-4 text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 text-foreground-secondary text-lg">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
              
              <div className="mt-3 flex items-center gap-2">
                <Rating value={user.rating} count={user.reviewCount} />
              </div>
              
              <div className="mt-5 text-foreground text-base leading-relaxed whitespace-pre-wrap">
                {user.bio}
              </div>
              
              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-3 border-b border-border pb-6">
                {isCurrentUser ? (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" 
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit profile
                  </Button>
                ) : (
                  <Button 
                    className="w-full font-medium" 
                    variant={hasSentRequest ? "outline" : "primary"}
                    onClick={() => !hasSentRequest && setIsRequestModalOpen(true)}
                    disabled={hasSentRequest}
                  >
                    {hasSentRequest ? "Request Sent" : "Request Exchange"}
                  </Button>
                )}

                <div className="flex gap-2">
                  {!isCurrentUser && (
                    <Button variant="outline" className="flex-1 font-medium bg-surface text-foreground hover:bg-surface-hover border-border">
                      <MessageSquare className="w-4 h-4 mr-2" /> Message
                    </Button>
                  )}
                </div>
              </div>

              {/* Details List */}
              <div className="mt-6 space-y-4 text-sm text-foreground-secondary">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Member since <strong className="text-foreground font-medium">{user.joinedDate || "Unknown"}</strong></span>
                </div>
                
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block mb-1">Languages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.languages?.length > 0 ? user.languages.map(lang => (
                        <span key={lang} className="text-xs text-foreground bg-surface border border-border px-2 py-0.5 rounded-full">{lang}</span>
                      )) : <span>Not specified</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block mb-1">Availability</span>
                    <span className="text-foreground font-medium">{user.availability || "Flexible"}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column - Tabs and Content */}
          <div className="flex-1 mt-8 md:mt-12">
            {/* Tabs (GitHub Style) */}
            <div className="flex items-center gap-6 border-b border-border">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`pb-3 text-sm md:text-base font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "overview" ? "border-primary text-foreground" : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border"}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 text-sm md:text-base font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === "reviews" ? "border-primary text-foreground" : "border-transparent text-foreground-secondary hover:text-foreground hover:border-border"}`}
              >
                Reviews
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs bg-surface-hover">{user.reviews?.length || 0}</Badge>
              </button>
            </div>

            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-surface-card border-border shadow-sm">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle as="h2" className="text-xl font-semibold">Skills to Teach</CardTitle>
                    <CardDescription className="text-sm">What {user.name.split(' ')[0]} can offer</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {user.offers.length > 0 ? (
                        user.offers.map(skill => (
                          <Badge key={skill} variant="brand" className="px-3 py-1.5 text-sm font-medium">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-foreground-secondary italic">No skills listed yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-surface-card border-border shadow-sm">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle as="h2" className="text-xl font-semibold">Skills to Learn</CardTitle>
                    <CardDescription className="text-sm">What {user.name.split(' ')[0]} is looking for</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-2">
                      {user.needs.length > 0 ? (
                        user.needs.map(skill => (
                          <Badge key={skill} variant="default" className="px-3 py-1.5 text-sm font-medium bg-surface border-border hover:bg-surface-hover">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-foreground-secondary italic">No skills listed yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reviews Tab Content */}
            {activeTab === "reviews" && (
              <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-surface-card border-border shadow-sm">
                  <CardHeader className="border-b border-border pb-4">
                    <CardTitle as="h2" className="text-xl font-semibold">Past Exchanges</CardTitle>
                    <CardDescription className="text-sm">Feedback from the community</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {user.reviews && user.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {user.reviews.map((review, index) => (
                          <div key={review.id} className={`pb-6 ${index !== user.reviews.length - 1 ? 'border-b border-border' : ''}`}>
                            <div className="flex items-start gap-4">
                              <Avatar src={review.avatar} alt={review.author} size="md" className="w-10 h-10 border border-border" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground text-sm">{review.author}</h4>
                                  <span className="text-xs text-foreground-secondary">• {review.date}</span>
                                </div>
                                <Rating value={review.rating} className="mt-1" size="sm" />
                                <p className="text-foreground mt-2 text-sm leading-relaxed">{review.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-border rounded-lg bg-surface">
                        <p className="text-sm text-foreground-secondary font-medium">No reviews yet.</p>
                        <p className="text-xs text-foreground-muted mt-1">Complete an exchange to get your first review.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Request Exchange Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Skill Exchange">
        <form onSubmit={handleRequestExchange} className="space-y-6">
          <p className="text-foreground-secondary text-sm">
            Set up an exchange with {user.name}. Choose what you want to learn and what you can offer in return.
          </p>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              I want to learn:
            </label>
            <select 
              value={wanting} 
              onChange={(e) => setWanting(e.target.value)}
              className="w-full bg-surface border border-border rounded-md p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            >
              <option value="" disabled>Select a skill from {user.name}</option>
              {user.offers.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              I can teach:
            </label>
            <select 
              value={offering} 
              onChange={(e) => setOffering(e.target.value)}
              className="w-full bg-surface border border-border rounded-md p-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            >
              <option value="" disabled>Select a skill you offer</option>
              {currentUser.offers.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            {currentUser.offers.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">You haven't listed any skills to offer yet! Go to your profile to add some.</p>
            )}
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border">
            <Button type="button" variant="outline" className="text-sm" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-sm" disabled={!wanting || !offering}>
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Full Name</label>
            <input 
              type="text" 
              value={editForm.name} 
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-surface border border-border rounded-md p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Location</label>
            <input 
              type="text" 
              value={editForm.location} 
              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-surface border border-border rounded-md p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Bio / Description</label>
            <textarea 
              value={editForm.bio} 
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-surface border border-border rounded-md p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Languages</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVAILABLE_LANGUAGES.map(lang => {
                const isSelected = editForm.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setEditForm(prev => ({
                        ...prev,
                        languages: isSelected 
                          ? prev.languages.filter(l => l !== lang)
                          : [...prev.languages, lang]
                      }))
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-surface border-border text-foreground-secondary hover:text-foreground hover:border-foreground-muted"
                    }`}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">Availability</label>
            <input 
              type="text" 
              value={editForm.availability} 
              onChange={(e) => setEditForm(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full bg-surface border border-border rounded-md p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Weekends & Evenings"
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-border mt-6">
            <Button type="button" variant="outline" className="text-sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="text-sm">
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Hidden File Input for Image Upload */}
      <input 
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageSelect}
      />

    </div>
  );
}
