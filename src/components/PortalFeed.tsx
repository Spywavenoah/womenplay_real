import React from "react";
import {
  MessageSquare, Send, Loader2, Sparkles, Heart,
  MessageCircle, RefreshCw, ChevronRight
} from "lucide-react";
import { User, Post, Comment } from "../types";

interface PortalFeedProps {
  currentUser: User;
}

export default function PortalFeed({ currentUser }: PortalFeedProps) {
  // Community Feed State
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loadingFeed, setLoadingFeed] = React.useState(false);
  const [postInput, setPostInput] = React.useState("");
  const [activePostComments, setActivePostComments] = React.useState<Record<string, { comments: Comment[], show: boolean }>>({});
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  // Fetch community and tickets data
  const loadPortalData = async () => {
    setLoadingFeed(true);
    try {
      // 1. Fetch Posts
      const pRes = await fetch("/api/community/posts");
      const pData = await pRes.json();
      setPosts(pData);

    } catch (e) {
      console.error("Failed to load portal data", e);
    } finally {
      setLoadingFeed(false);
    }
  };

  React.useEffect(() => {
    loadPortalData();
  }, [currentUser.id]);

  // Submit Community Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postInput.trim()) return;

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content: postInput })
      });
      if (res.ok) {
        setPostInput("");
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Like Post
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Show Comments Drawer
  const handleToggleComments = async (postId: string) => {
    const isShowing = activePostComments[postId]?.show;
    if (isShowing) {
      setActivePostComments({
        ...activePostComments,
        [postId]: { ...activePostComments[postId], show: false }
      });
    } else {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        const data = await res.json();
        setActivePostComments({
          ...activePostComments,
          [postId]: { comments: data, show: true }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Submit Comment
  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, content })
      });
      if (res.ok) {
        setCommentInputs({ ...commentInputs, [postId]: "" });
        // Reload comments
        const commRes = await fetch(`/api/community/posts/${postId}/comments`);
        const commData = await commRes.json();
        setActivePostComments({
          ...activePostComments,
          [postId]: { comments: commData, show: true }
        });
        loadPortalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" id="panel-community-feed">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900">WomenPlay Community Timeline</h2>
          <p className="text-slate-500 text-xs">Share strategic objectives, updates, or coordinate leadership breaks with fellows.</p>
        </div>
        <button
          onClick={loadPortalData}
          id="btn-refresh-feed"
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-pink hover:bg-slate-50 transition"
          title="Refresh Timeline"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Post Creation Form */}
      <form onSubmit={handleCreatePost} className="flex gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
        <img
          src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
          alt={currentUser.fullName}
          className="w-10 h-10 rounded-full border border-brand-gold object-cover"
        />
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            placeholder="What executive breakthrough or networking request would you like to share?"
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
            id="textarea-feed-post"
            rows={2}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 italic">Timeline posts are monitored for high-society decorum.</span>
            <button
              type="submit"
              id="btn-submit-post"
              className="bg-brand-pink hover:bg-brand-pink-dark text-white text-xs font-bold py-2 px-5 rounded-xl shadow-md transition"
            >
              Share Post
            </button>
          </div>
        </div>
      </form>

      {/* Timeline List */}
      <div className="space-y-6 mt-6">
        {loadingFeed ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-brand-pink mr-2" />
            <span>Downloading community insights...</span>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="border border-slate-100 rounded-2xl p-6 space-y-4 shadow-xs" id={`feed-post-${post.id}`}>
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex space-x-3">
                  <img
                    src={post.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                    alt={post.userFullName}
                    className="w-11 h-11 rounded-full object-cover border border-brand-gold/60"
                  />
                  <div className="text-left leading-snug">
                    <h4 className="text-sm font-bold text-slate-900">{post.userFullName}</h4>
                    <span className="text-slate-500 text-[10px]">{post.userTitle || "Executive Fellow"}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Post Content */}
              <p className="text-slate-700 text-xs leading-relaxed text-left whitespace-pre-line">{post.content}</p>

              {/* Action buttons */}
              <div className="flex items-center space-x-6 border-t border-b border-slate-50 py-3 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => handleLikePost(post.id)}
                  id={`btn-like-post-${post.id}`}
                  className={`flex items-center space-x-1.5 hover:text-brand-pink transition ${
                    post.likes.includes(currentUser.id) ? "text-brand-pink" : ""
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{post.likes.length} Likes</span>
                </button>

                <button
                  onClick={() => handleToggleComments(post.id)}
                  id={`btn-toggle-comments-${post.id}`}
                  className="flex items-center space-x-1.5 hover:text-brand-pink transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount} Comments</span>
                </button>
              </div>

              {/* Comments Area */}
              {activePostComments[post.id]?.show && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl text-xs">
                  <div className="space-y-3">
                    {activePostComments[post.id].comments.map((comm) => (
                      <div key={comm.id} className="flex gap-2 text-left">
                        <img src={comm.userAvatar} alt={comm.userFullName} className="w-7 h-7 rounded-full object-cover" />
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex-1">
                          <p className="font-bold text-slate-900 text-[11px]">{comm.userFullName}</p>
                          <p className="text-slate-600 mt-1">{comm.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment input form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add strategic feedback..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      id={`input-comment-${post.id}`}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      id={`btn-submit-comment-${post.id}`}
                      className="p-2 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl transition"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
            No post insights shared on the timeline yet. Be the first to start the connection!
          </div>
        )}
      </div>
    </div>
  );
}
