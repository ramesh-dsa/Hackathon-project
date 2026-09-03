"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "./supabase/client";
import { useRouter } from "next/navigation";

const UserContext = createContext();

// Create the supabase client once — outside the component to avoid recreation on render.
const supabase = createClient();

export function UserProvider({ children }) {
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Use a ref to track whether initial load has completed, to avoid
  // the onAuthStateChange SIGNED_IN event triggering a redundant loadData
  // on first mount (Supabase fires SIGNED_IN even for existing sessions on init).
  const initialLoadDone = useRef(false);

  const clearUserState = useCallback(() => {
    setCurrentUser(null);
    setAuthUser(null);
    setAllUsers([]);
    setExchanges([]);
    setRequests({ incoming: [], sent: [] });
  }, []);

  const loadData = useCallback(async () => {
    try {
    // 1. Get authenticated user — always use getUser() for server-validated identity
    const { data: { user: authUserData }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUserData) {
      // No authenticated user — clear state and stop loading
      clearUserState();
      setLoading(false);
      return;
    }

    setAuthUser(authUserData);
    const myId = authUserData.id;

    // 2. Fetch all user profiles with nested data
    const { data: dbUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        skills(type, skill_name),
        user_languages(language),
        reviews:reviews!reviews_user_id_fkey(id, author_name, author_avatar, rating, text, date_display)
      `);
    
    if (usersError) {
      console.error("Error loading users:", usersError);
    }
    
    const dedupeSkills = (skills, type) => {
        const seen = new Set();
        const result = [];
        (skills || []).filter(s => s.type === type).forEach(s => {
          const name = s.skill_name.trim();
          const lower = name.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            result.push(name);
          }
        });
        return result;
      };

    const formattedUsers = dbUsers?.map(u => ({
      ...u,
      reviewCount: u.review_count,
      coverImage: u.cover_image,
      joinedDate: u.joined_date,
      offers: dedupeSkills(u.skills, 'offer'),
      needs: dedupeSkills(u.skills, 'need'),
      languages: (u.user_languages || []).map(l => l.language),
      reviews: (u.reviews || []).map(r => ({
         id: r.id, 
         author: r.author_name, 
         avatar: r.author_avatar, 
         rating: r.rating, 
         text: r.text, 
         date: r.date_display 
      }))
    })) || [];

    setAllUsers(formattedUsers);
    
    // Find the current authenticated user's profile row
    let me = formattedUsers.find(u => u.id === myId);

    if (!me && authUserData) {
      const fallbackName = authUserData.user_metadata?.name || authUserData.email?.split('@')[0] || 'User';
      const fallbackLocation = authUserData.user_metadata?.location || 'Remote';
      
      const newProfile = {
        id: myId,
        name: fallbackName,
        email: authUserData.email,
        bio: 'Skill Exchange Enthusiast',
        location: fallbackLocation,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        rating: 5.0,
        review_count: 0,
        joined_date: 'Just joined'
      };

      const { data: insertedUser, error: insertErr } = await supabase
        .from('users')
        .upsert([newProfile])
        .select()
        .maybeSingle();

      if (!insertErr && insertedUser) {
        me = {
          ...insertedUser,
          offers: [],
          needs: [],
          languages: [],
          reviews: []
        };
        formattedUsers.push(me);
        setAllUsers([...formattedUsers]);
      } else {
        me = {
          id: myId,
          name: fallbackName,
          email: authUserData.email,
          bio: 'Skill Exchange Enthusiast',
          location: fallbackLocation,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          offers: [],
          needs: [],
          languages: [],
          reviews: []
        };
      }
    }

    setCurrentUser(me || null);

    // 3. Fetch Exchanges (RLS auto-filters to participant)
    const { data: dbExchanges, error: exError } = await supabase
      .from('exchanges')
      .select(`
        id, status, user1_id, user2_id, user1_offering, user2_offering, last_updated,
        user1:users!user1_id(name, avatar),
        user2:users!user2_id(name, avatar)
      `);
      
    if (exError) {
      console.error("Error loading exchanges:", exError);
    } else if (dbExchanges) {
      const formattedExchanges = dbExchanges.map(e => {
        const iAmUser1 = e.user1_id === myId;
        const me = iAmUser1 ? e.user1 : e.user2;
        const partner = iAmUser1 ? e.user2 : e.user1;
        return {
          id: e.id,
          status: e.status,
          you: { 
            name: me?.name, 
            offering: iAmUser1 ? e.user1_offering : e.user2_offering 
          },
          partner: { 
            id: iAmUser1 ? e.user2_id : e.user1_id,
            name: partner?.name, 
            offering: iAmUser1 ? e.user2_offering : e.user1_offering, 
            avatar: partner?.avatar 
          },
          lastUpdated: e.last_updated
        };
      });
      setExchanges(formattedExchanges);
    }

    // 4. Fetch Requests (RLS auto-filters to sender/receiver)
    // Fetch all statuses so requests page shows full history
    const { data: dbRequests, error: reqError } = await supabase
      .from('requests')
      .select(`
        id, sender_id, receiver_id, offering, wanting, status, date_display,
        sender:users!sender_id(id, name, avatar),
        receiver:users!receiver_id(id, name, avatar)
      `)
      .order('date_display', { ascending: false });

    if (reqError) {
      console.error("Error loading requests:", reqError);
    } else if (dbRequests) {
      // Incoming: requests where I am the receiver (all statuses for requests page)
      const incoming = dbRequests
        .filter(r => r.receiver_id === myId)
        .map(r => ({
           id: r.id,
           user: { id: r.sender?.id, name: r.sender?.name, avatar: r.sender?.avatar },
           offering: r.offering,
           wanting: r.wanting,
           date: r.date_display,
           status: r.status
        }));
        
      // Sent: requests where I am the sender (all statuses)
      const sent = dbRequests
        .filter(r => r.sender_id === myId)
        .map(r => ({
           id: r.id,
           user: { id: r.receiver?.id, name: r.receiver?.name, avatar: r.receiver?.avatar },
           offering: r.offering,
           wanting: r.wanting,
           date: r.date_display,
           status: r.status
        }));
        
      setRequests({ incoming, sent });
    }

    } catch (err) {
      console.error('Exception in loadData:', err);
    } finally {
      setLoading(false);
    }
  }, [clearUserState]);

  useEffect(() => {
    // Initial data load
    loadData().then(() => {
      initialLoadDone.current = true;
    });

    // Auth state listener — handles session changes after initial load
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearUserState();
        setLoading(false);
      } else if (event === 'SIGNED_IN' && initialLoadDone.current) {
        loadData();
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed — no need to reload data, session is still valid
      } else if (event === 'USER_UPDATED') {
        loadData();
      }
    });

    // Realtime subscription for instant updates when new users join or update profiles
    const usersSubscription = supabase
      .channel('public-users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        setAllUsers((prevUsers) => {
          if (payload.eventType === 'INSERT') {
            if (prevUsers.some(u => u.id === payload.new.id)) return prevUsers;
            const newUser = {
              ...payload.new,
              reviewCount: payload.new.review_count || 0,
              coverImage: payload.new.cover_image,
              joinedDate: payload.new.joined_date,
              offers: [],
              needs: [],
              languages: [],
              reviews: []
            };
            return [...prevUsers, newUser];
          } else if (payload.eventType === 'UPDATE') {
            return prevUsers.map(u => {
              if (u.id === payload.new.id) {
                return {
                  ...u,
                  ...payload.new,
                  reviewCount: payload.new.review_count !== undefined ? payload.new.review_count : u.reviewCount,
                  coverImage: payload.new.cover_image !== undefined ? payload.new.cover_image : u.coverImage,
                  joinedDate: payload.new.joined_date !== undefined ? payload.new.joined_date : u.joinedDate,
                };
              }
              return u;
            });
          } else if (payload.eventType === 'DELETE') {
            return prevUsers.filter(u => u.id !== payload.old.id);
          }
          return prevUsers;
        });

        setCurrentUser((prevMe) => {
          if (!prevMe) return prevMe;
          if (payload.eventType === 'UPDATE' && prevMe.id === payload.new.id) {
            return {
              ...prevMe,
              ...payload.new,
              reviewCount: payload.new.review_count !== undefined ? payload.new.review_count : prevMe.reviewCount,
              coverImage: payload.new.cover_image !== undefined ? payload.new.cover_image : prevMe.coverImage,
              joinedDate: payload.new.joined_date !== undefined ? payload.new.joined_date : prevMe.joinedDate,
            };
          } else if (payload.eventType === 'DELETE' && prevMe.id === payload.old.id) {
            return null;
          }
          return prevMe;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills' }, (payload) => {
        setAllUsers((prevUsers) => {
          return prevUsers.map(u => {
            if (u.id === payload.new?.user_id || u.id === payload.old?.user_id) {
              
              if (payload.eventType === 'INSERT') {
                const newSkill = payload.new.skill_name.trim();
                const type = payload.new.type;
                if (type === 'offer' && !u.offers.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
                  return { ...u, offers: [...u.offers, newSkill] };
                } else if (type === 'need' && !u.needs.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
                  return { ...u, needs: [...u.needs, newSkill] };
                }
              } else if (payload.eventType === 'DELETE') {
                const oldSkill = payload.old.skill_name;
                const type = payload.old.type;
                if (type === 'offer') {
                  return { ...u, offers: u.offers.filter(s => s.toLowerCase() !== oldSkill.toLowerCase()) };
                } else if (type === 'need') {
                  return { ...u, needs: u.needs.filter(s => s.toLowerCase() !== oldSkill.toLowerCase()) };
                }
              }
            }
            return u;
          });
        });
        
        setCurrentUser((prevMe) => {
          if (!prevMe) return prevMe;
          if (prevMe.id === payload.new?.user_id || prevMe.id === payload.old?.user_id) {
            if (payload.eventType === 'INSERT') {
              const newSkill = payload.new.skill_name.trim();
              const type = payload.new.type;
              if (type === 'offer' && !prevMe.offers.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
                return { ...prevMe, offers: [...prevMe.offers, newSkill] };
              } else if (type === 'need' && !prevMe.needs.some(s => s.toLowerCase() === newSkill.toLowerCase())) {
                return { ...prevMe, needs: [...prevMe.needs, newSkill] };
              }
            } else if (payload.eventType === 'DELETE') {
              const oldSkill = payload.old.skill_name;
              const type = payload.old.type;
              if (type === 'offer') {
                return { ...prevMe, offers: prevMe.offers.filter(s => s.toLowerCase() !== oldSkill.toLowerCase()) };
              } else if (type === 'need') {
                return { ...prevMe, needs: prevMe.needs.filter(s => s.toLowerCase() !== oldSkill.toLowerCase()) };
              }
            }
          }
          return prevMe;
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(usersSubscription);
    };
  }, [loadData, clearUserState]);

  const logout = async () => {
    await supabase.auth.signOut();
    clearUserState();
    setLoading(false);
    router.push('/login');
    router.refresh();
  };

  const updateProfile = async (updatedData) => {
    if (!currentUser) return;

    // 1. Optimistic UI update
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
    
    // 2. Map camelCase keys to snake_case for Supabase
    const dbData = {};
    if (updatedData.bio !== undefined) dbData.bio = updatedData.bio;
    if (updatedData.location !== undefined) dbData.location = updatedData.location;
    if (updatedData.name !== undefined) dbData.name = updatedData.name;
    if (updatedData.avatar !== undefined) dbData.avatar = updatedData.avatar;
    if (updatedData.coverImage !== undefined) dbData.cover_image = updatedData.coverImage;
    if (updatedData.availability !== undefined) dbData.availability = updatedData.availability;

    if (Object.keys(dbData).length > 0) {
      const { error } = await supabase.from('users').update(dbData).eq('id', currentUser.id);
      if (error) {
        console.error("Failed to update profile:", error);
      }
    }

    // 3. Handle languages separately (delete + re-insert)
    if (updatedData.languages) {
      const { error: delError } = await supabase
        .from('user_languages')
        .delete()
        .eq('user_id', currentUser.id);
      if (delError) console.error("Failed to delete old languages:", delError);
      
      if (updatedData.languages.length > 0) {
        const langInserts = updatedData.languages.map(lang => ({
          user_id: currentUser.id,
          language: lang
        }));
        const { error: langError } = await supabase.from('user_languages').insert(langInserts);
        if (langError) console.error("Failed to insert new languages:", langError);
      }
    }
  };

  const addOffer = async (skill) => {
    if (!currentUser || !skill || (currentUser?.offers || []).some(s => s.toLowerCase() === skill.toLowerCase())) return;
    
    const { error } = await supabase.from('skills').insert([{ user_id: currentUser.id, type: 'offer', skill_name: skill.trim() }]);
    if (error) {
      console.error("Failed to add offer:", error);
      return;
    }
    const newOffers = [...(currentUser?.offers || []), skill.trim()];
    setCurrentUser(prev => ({ ...prev, offers: newOffers }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, offers: newOffers } : u));
  };

  const removeOffer = async (skill) => {
    if (!currentUser) return;
    const { error } = await supabase.from('skills').delete().eq('user_id', currentUser.id).eq('type', 'offer').ilike('skill_name', skill);
    if (error) {
      console.error("Failed to remove offer:", error);
      return;
    }
    const newOffers = (currentUser?.offers || []).filter(s => s.toLowerCase() !== skill.toLowerCase());
    setCurrentUser(prev => ({ ...prev, offers: newOffers }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, offers: newOffers } : u));
  };

  const addNeed = async (skill) => {
    if (!currentUser || !skill || (currentUser?.needs || []).some(s => s.toLowerCase() === skill.toLowerCase())) return;
    
    const { error } = await supabase.from('skills').insert([{ user_id: currentUser.id, type: 'need', skill_name: skill.trim() }]);
    if (error) {
      console.error("Failed to add need:", error);
      return;
    }
    const newNeeds = [...(currentUser?.needs || []), skill.trim()];
    setCurrentUser(prev => ({ ...prev, needs: newNeeds }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, needs: newNeeds } : u));
  };

  const removeNeed = async (skill) => {
    if (!currentUser) return;
    const { error } = await supabase.from('skills').delete().eq('user_id', currentUser.id).eq('type', 'need').ilike('skill_name', skill);
    if (error) {
      console.error("Failed to remove need:", error);
      return;
    }
    const newNeeds = (currentUser?.needs || []).filter(s => s.toLowerCase() !== skill.toLowerCase());
    setCurrentUser(prev => ({ ...prev, needs: newNeeds }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, needs: newNeeds } : u));
  };

  const sendRequest = async (targetUser, offering, wanting) => {
    if (!currentUser) return;
    const newRequest = {
      sender_id: currentUser.id,
      receiver_id: targetUser.id,
      offering,
      wanting,
      status: 'pending',
      date_display: "Just now"
    };

    const { data, error } = await supabase.from('requests').insert([newRequest]).select().single();
    if (error) {
      console.error("Failed to send request:", JSON.stringify(error, null, 2), error.message, error.details, error.hint, error.code);
      throw new Error(`Supabase Error: ${error.message || JSON.stringify(error)}`);
      return;
    }

    setRequests(prev => ({
      ...prev,
      sent: [{
        id: data.id,
        user: targetUser,
        offering,
        wanting,
        status: "pending",
        date: "Just now"
      }, ...prev.sent]
    }));
  };

  const acceptRequest = async (requestId) => {
    if (!currentUser) return;
    const requestToAccept = requests.incoming.find(r => r.id === requestId);
    if (!requestToAccept) return;
    
    const { error: reqError } = await supabase.from('requests').update({ status: 'accepted' }).eq('id', requestId);
    if (reqError) {
      console.error("Failed to accept request:", reqError);
      return;
    }

    const newExchange = {
      status: 'in-progress',
      user1_id: currentUser.id,
      user2_id: requestToAccept.user.id,
      user1_offering: requestToAccept.wanting,
      user2_offering: requestToAccept.offering,
      last_updated: "Just now"
    };

    const { data: exData, error: exError } = await supabase.from('exchanges').insert([newExchange]).select().single();
    if (exError) {
      console.error("Failed to create exchange:", exError);
      return;
    }

    setRequests(prev => ({
      ...prev,
      incoming: prev.incoming.filter(r => r.id !== requestId)
    }));
    
    setExchanges(prev => [{
      id: exData.id,
      status: "in-progress",
      you: { name: currentUser.name, offering: requestToAccept.wanting },
      partner: { name: requestToAccept.user.name, offering: requestToAccept.offering, avatar: requestToAccept.user.avatar },
      lastUpdated: "Just now"
    }, ...prev]);
  };

  const declineRequest = async (requestId) => {
    const { error } = await supabase.from('requests').update({ status: 'declined' }).eq('id', requestId);
    if (error) {
      console.error("Failed to decline request:", error);
      return;
    }
    setRequests(prev => ({
      ...prev,
      incoming: prev.incoming.filter(r => r.id !== requestId)
    }));
  };

  const cancelRequest = async (requestId) => {
    const { error } = await supabase.from('requests').delete().eq('id', requestId);
    if (error) {
      console.error("Failed to cancel request:", error);
      return;
    }
    setRequests(prev => ({
      ...prev,
      sent: prev.sent.filter(r => r.id !== requestId)
    }));
  };

  const completeExchange = async (exchangeId) => {
    const { error } = await supabase.from('exchanges').update({ status: 'completed', last_updated: 'Just now' }).eq('id', exchangeId);
    if (error) {
      console.error("Failed to complete exchange:", error);
      return;
    }
    setExchanges(prev => prev.map(exc => 
      exc.id === exchangeId ? { ...exc, status: "completed", lastUpdated: "Just now" } : exc
    ));
  };

  const getOrCreateConversation = async (partnerId) => {
    if (!currentUser) return null;
    
    // Enforce deterministic ordering for (user1, user2)
    const user1_id = currentUser.id < partnerId ? currentUser.id : partnerId;
    const user2_id = currentUser.id < partnerId ? partnerId : currentUser.id;

    // First try to select it
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .maybeSingle();
      
    if (existing) return existing.id;
    
    // If not exists, try to insert
    const { data: inserted, error: insertErr } = await supabase
      .from('conversations')
      .insert([{ user1_id, user2_id }])
      .select('id')
      .maybeSingle();
      
    if (inserted) return inserted.id;
    
    // If insertion failed (likely due to unique constraint race condition), fetch again
    if (insertErr && insertErr.code === '23505') {
      const { data: retry } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .maybeSingle();
      if (retry) return retry.id;
    }
    
    console.error("Failed to get or create conversation", insertErr);
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-label="Loading" role="status" />
          <p className="text-sm text-foreground-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{ 
        currentUser, authUser, updateProfile, addOffer, removeOffer, addNeed, removeNeed,
        allUsers, exchanges, requests,
        sendRequest, acceptRequest, declineRequest, cancelRequest, completeExchange,
        getOrCreateConversation,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
