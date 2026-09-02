"use client";

import React, { createContext, useContext, useState } from "react";
import { users as initialUsers, exchanges as initialExchanges, requests as initialRequests } from "./mock-data";

const UserContext = createContext();

export function UserProvider({ children }) {
  // Global State
  const [allUsers, setAllUsers] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[0]); // Ramesh
  const [exchanges, setExchanges] = useState(initialExchanges);
  const [requests, setRequests] = useState(initialRequests);

  const updateProfile = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedData } : u));
  };

  // Skill Modifiers
  const addOffer = (skill) => {
    if (!skill || currentUser.offers.includes(skill)) return;
    setCurrentUser((prev) => ({
      ...prev,
      offers: [...prev.offers, skill],
    }));
  };

  const removeOffer = (skill) => {
    setCurrentUser((prev) => ({
      ...prev,
      offers: prev.offers.filter((s) => s !== skill),
    }));
  };

  const addNeed = (skill) => {
    if (!skill || currentUser.needs.includes(skill)) return;
    setCurrentUser((prev) => ({
      ...prev,
      needs: [...prev.needs, skill],
    }));
  };

  const removeNeed = (skill) => {
    setCurrentUser((prev) => ({
      ...prev,
      needs: prev.needs.filter((s) => s !== skill),
    }));
  };

  // Request Modifiers
  const sendRequest = (targetUser, offering, wanting) => {
    const newRequest = {
      id: `r${Date.now()}`,
      user: targetUser,
      offering,
      wanting,
      status: "pending",
      date: "Just now"
    };
    setRequests(prev => ({
      ...prev,
      sent: [newRequest, ...prev.sent]
    }));
  };

  const acceptRequest = (requestId) => {
    const requestToAccept = requests.incoming.find(r => r.id === requestId);
    if (!requestToAccept) return;
    
    // Remove from incoming
    setRequests(prev => ({
      ...prev,
      incoming: prev.incoming.filter(r => r.id !== requestId)
    }));
    
    // Add to active exchanges
    const newExchange = {
      id: `e${Date.now()}`,
      status: "in-progress",
      you: { name: currentUser.name, offering: requestToAccept.wanting },
      partner: { name: requestToAccept.user.name, offering: requestToAccept.offering, avatar: requestToAccept.user.avatar },
      lastUpdated: "Just now"
    };
    
    setExchanges(prev => [newExchange, ...prev]);
  };

  const declineRequest = (requestId) => {
    setRequests(prev => ({
      ...prev,
      incoming: prev.incoming.filter(r => r.id !== requestId)
    }));
  };

  const cancelRequest = (requestId) => {
    setRequests(prev => ({
      ...prev,
      sent: prev.sent.filter(r => r.id !== requestId)
    }));
  };

  // Exchange Modifiers
  const completeExchange = (exchangeId) => {
    setExchanges(prev => prev.map(exc => 
      exc.id === exchangeId ? { ...exc, status: "completed", lastUpdated: "Just now" } : exc
    ));
  };

  return (
    <UserContext.Provider
      value={{ 
        currentUser, updateProfile, addOffer, removeOffer, addNeed, removeNeed,
        allUsers, exchanges, requests,
        sendRequest, acceptRequest, declineRequest, cancelRequest, completeExchange
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
