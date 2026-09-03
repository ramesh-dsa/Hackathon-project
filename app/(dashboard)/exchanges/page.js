"use client";

import { useState } from "react";
import Link from "next/link";

import { useUser } from "../../../lib/user-context";
import { Modal } from "../../../components/ui/modal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Avatar } from "../../../components/ui/avatar";

import { useRouter } from "next/navigation";

export default function ExchangesPage() {
  const { exchanges, completeExchange, completeAndReviewExchange, getOrCreateConversation } = useUser();
  const router = useRouter();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const handleMarkCompletedClick = (exc) => {
    setSelectedExchange(exc);
    setRating(5);
    setReviewText("");
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (selectedExchange) {
      completeAndReviewExchange(selectedExchange.id, selectedExchange.partner.id, rating, reviewText);
    }
    setReviewModalOpen(false);
    setSelectedExchange(null);
  };

  const handleMessageClick = async (partnerId) => {
    const conversationId = await getOrCreateConversation(partnerId);
    if (conversationId) {
      router.push(`/messages/${conversationId}`);
    } else {
      console.error("Failed to start conversation");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Exchanges</h1>
        <p className="text-foreground-secondary mt-1">Track your ongoing learning and teaching sessions.</p>
      </div>

      <div className="space-y-6">
        {exchanges.length === 0 ? (
          <p className="text-foreground-muted">You have no active or completed exchanges.</p>
        ) : (
          exchanges.map(exc => (
            <Card key={exc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <Avatar src={exc.partner.avatar} alt={exc.partner.name} size="md" />
                    <div>
                      <CardTitle as="h2" className="text-xl">Exchange with {exc.partner.name}</CardTitle>
                      <CardDescription>Updated {exc.lastUpdated}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={exc.status === "completed" ? "success" : "brand"}>
                    {exc.status === "completed" ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-surface rounded-xl border border-border">
                  <div className="text-center md:text-left flex-1">
                    <p className="text-sm text-foreground-secondary mb-1">You are teaching</p>
                    <p className="text-lg font-semibold text-primary">{exc.you.offering}</p>
                  </div>
                  <div className="my-4 md:my-0 flex items-center justify-center p-3 rounded-full bg-surface-elevated border border-border">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-foreground-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </div>
                  <div className="text-center md:text-right flex-1">
                    <p className="text-sm text-foreground-secondary mb-1">You are learning</p>
                    <p className="text-lg font-semibold text-foreground">{exc.partner.offering}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t border-border p-4">
                <Button variant="outline" onClick={() => handleMessageClick(exc.partner.id)}>
                  Message
                </Button>
                {exc.status === "in-progress" && (
                  <Button variant="primary" onClick={() => handleMarkCompletedClick(exc)}>Mark Completed</Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Leave a Review">
        {selectedExchange && (
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <p className="text-sm text-foreground-secondary">
              You have completed your exchange with <span className="font-semibold text-foreground">{selectedExchange.partner.name}</span>! 
              Please leave a rating and review to help others know about your experience.
            </p>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 transition-transform hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`w-8 h-8 ${star <= rating ? 'text-warning' : 'text-surface-hover border-border border rounded-full bg-surface-hover'}`}
                    >
                      {star <= rating && (
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review" className="block text-sm font-medium text-foreground">
                Your Review
              </label>
              <textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder={`What did you learn from ${selectedExchange.partner.name}? Was it a good experience?`}
                className="w-full bg-surface border border-border rounded-md p-3 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[120px]"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
