"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createClient } from '../../lib/supabase/client';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export function CompleteProfileForm() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  // Step 1 fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);

  // Step 2 fields
  const [offerInput, setOfferInput] = useState('');
  const [needInput, setNeedInput] = useState('');
  const [offers, setOffers] = useState([]);
  const [needs, setNeeds] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Load existing user data on mount
  useEffect(() => {
    async function loadUser() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Pre-fill from existing profile row
      const { data: profile } = await supabase
        .from('users')
        .select('name, location, bio, avatar, profile_complete')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.profile_complete) {
        // Already done — skip straight to dashboard
        router.replace('/dashboard');
        return;
      }

      if (profile) {
        if (profile.name && profile.name !== 'New User') setName(profile.name);
        if (profile.location) setLocation(profile.location);
        if (profile.bio) setBio(profile.bio);
        if (profile.avatar) setAvatar(profile.avatar);
      }

      // Pre-fill from auth metadata (name from registration)
      if (!name && user.user_metadata?.name) {
        setName(user.user_metadata.name);
      }
      if (!location && user.user_metadata?.location) {
        setLocation(user.user_metadata.location);
      }

      // Load existing skills
      const { data: skillRows } = await supabase
        .from('skills')
        .select('type, skill_name')
        .eq('user_id', user.id);

      if (skillRows) {
        setOffers(skillRows.filter(s => s.type === 'offer').map(s => s.skill_name));
        setNeeds(skillRows.filter(s => s.type === 'need').map(s => s.skill_name));
      }

      setIsLoading(false);
    }
    loadUser();
  }, []);

  const validateStep1 = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!location.trim()) errs.location = 'Please enter your location.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddOffer = (e) => {
    e?.preventDefault();
    const trimmed = offerInput.trim();
    if (trimmed && !offers.includes(trimmed)) {
      setOffers(prev => [...prev, trimmed]);
    }
    setOfferInput('');
  };

  const handleAddNeed = (e) => {
    e?.preventDefault();
    const trimmed = needInput.trim();
    if (trimmed && !needs.includes(trimmed)) {
      setNeeds(prev => [...prev, trimmed]);
    }
    setNeedInput('');
  };

  const handleOfferKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddOffer();
    }
  };

  const handleNeedKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddNeed();
    }
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setIsSaving(true);
    setError('');

    // Update user profile
    const { error: updateErr } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        location: location.trim(),
        bio: bio.trim() || 'Skill Exchange Enthusiast',
        avatar,
        profile_complete: true,
        joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      })
      .eq('id', userId);

    if (updateErr) {
      setError('Failed to save profile. Please try again.');
      setIsSaving(false);
      return;
    }

    // Sync skills — delete old ones and re-insert
    await supabase.from('skills').delete().eq('user_id', userId);

    const skillInserts = [
      ...offers.map(s => ({ user_id: userId, type: 'offer', skill_name: s })),
      ...needs.map(s => ({ user_id: userId, type: 'need', skill_name: s })),
    ];

    if (skillInserts.length > 0) {
      const { error: skillErr } = await supabase.from('skills').insert(skillInserts);
      if (skillErr) {
        console.error('Failed to save skills:', skillErr);
      }
    }

    setIsSaving(false);
    router.push('/dashboard');
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-foreground-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {step === 1 ? 'Set up your profile' : 'Add your skills'}
        </h2>
        <p className="text-sm text-foreground-secondary">
          {step === 1
            ? 'Tell the community a little about yourself.'
            : 'What can you teach? What do you want to learn?'}
        </p>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-error/10 border border-error/20 px-4 py-3 text-sm text-error text-center font-medium" role="alert">
          {error}
        </div>
      )}

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Avatar picker */}
          <div className="space-y-3">
            <Label>Choose your avatar</Label>
            <div className="flex flex-wrap gap-3 justify-center">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(url)}
                  className={`rounded-full overflow-hidden border-2 transition-all ${
                    avatar === url ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent hover:border-border-strong'
                  }`}
                  aria-label={`Select avatar ${i + 1}`}
                  aria-pressed={avatar === url}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Avatar ${i + 1}`} className="w-14 h-14 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="cp-name">Full Name <span className="text-error">*</span></Label>
            <Input
              id="cp-name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={e => { setName(e.target.value); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
              aria-invalid={!!errors.name}
              className={errors.name ? 'border-error focus-visible:ring-error' : ''}
            />
            {errors.name && <p className="text-sm text-error font-medium" role="alert">{errors.name}</p>}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="cp-location">Location <span className="text-error">*</span></Label>
            <Input
              id="cp-location"
              type="text"
              placeholder="City, Country"
              value={location}
              onChange={e => { setLocation(e.target.value); if (errors.location) setErrors(p => ({ ...p, location: undefined })); }}
              aria-invalid={!!errors.location}
              className={errors.location ? 'border-error focus-visible:ring-error' : ''}
            />
            {errors.location && <p className="text-sm text-error font-medium" role="alert">{errors.location}</p>}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="cp-bio">Bio <span className="text-foreground-muted text-xs">(optional)</span></Label>
            <textarea
              id="cp-bio"
              rows={3}
              placeholder="Tell people what you're passionate about..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-colors"
            />
          </div>

          <Button variant="primary" className="w-full" onClick={handleNext}>
            Next — Add Skills →
          </Button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Offers */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="cp-offer">Skills I Can Teach</Label>
              <p className="text-xs text-foreground-muted mt-0.5">Press Enter or comma to add</p>
            </div>
            <div className="flex gap-2">
              <Input
                id="cp-offer"
                type="text"
                placeholder="e.g. React, UI Design, Python..."
                value={offerInput}
                onChange={e => setOfferInput(e.target.value)}
                onKeyDown={handleOfferKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="small" onClick={handleAddOffer}>Add</Button>
            </div>
            {offers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {offers.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setOffers(prev => prev.filter(s => s !== skill))}
                      className="hover:text-error transition-colors leading-none"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Needs */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="cp-need">Skills I Want to Learn</Label>
              <p className="text-xs text-foreground-muted mt-0.5">Press Enter or comma to add</p>
            </div>
            <div className="flex gap-2">
              <Input
                id="cp-need"
                type="text"
                placeholder="e.g. Next.js, Photography, Spanish..."
                value={needInput}
                onChange={e => setNeedInput(e.target.value)}
                onKeyDown={handleNeedKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="small" onClick={handleAddNeed}>Add</Button>
            </div>
            {needs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {needs.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-elevated text-foreground-secondary rounded-full border border-border"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setNeeds(prev => prev.filter(s => s !== skill))}
                      className="hover:text-error transition-colors leading-none"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? 'Saving...' : 'Complete Profile 🎉'}
            </Button>
          </div>

          <p className="text-xs text-center text-foreground-muted">
            You can always update your skills later from My Skills page.
          </p>
        </div>
      )}
    </div>
  );
}
