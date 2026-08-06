import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { User, SuccessStory } from "../types";

interface PortalStoriesProps {
  currentUser: User;
}

export default function PortalStories({ currentUser }: PortalStoriesProps) {
  const [myStories, setMyStories] = React.useState<SuccessStory[]>([]);
  const [storyTitle, setStoryTitle] = React.useState("");
  const [storyContent, setStoryContent] = React.useState("");
  const [submittingStory, setSubmittingStory] = React.useState(false);
  const [storySuccess, setStorySuccess] = React.useState(false);
  const [storyRefinement, setStoryRefinement] = React.useState("");
  const [refiningStory, setRefiningStory] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/success-stories")
      .then(r => r.json())
      .then(data => setMyStories(data.filter((s: SuccessStory) => s.userId === currentUser.id)))
      .catch(() => {});
  }, [currentUser.id]);

  const handleRefineStory = async () => {
    if (!storyContent.trim()) return;
    setRefiningStory(true);
    setStoryRefinement("");
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: (window as any).__GEMINI_API_KEY__ || import.meta.env.VITE_GEMINI_API_KEY || "" });
      const data = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Success Story Title: ${storyTitle}\nDraft Story: ${storyContent}\n\nPlease improve this story to sound incredibly professional and inspiring for women leaders. Highlight standard executive metrics and make it sound elegant.`,
      });
      setStoryRefinement((data as any).response || (data as any).text || "Failed to generate recommendation.");
    } catch {
      setStoryRefinement("Offline refinement: Ensure your executive draft emphasizes leadership outcomes.");
    } finally {
      setRefiningStory(false);
    }
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle || !storyContent) return;
    setSubmittingStory(true);
    setStorySuccess(false);
    try {
      const res = await fetch("/api/success-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, title: storyTitle, content: storyContent })
      });
      if (res.ok) {
        const data = await res.json();
        setMyStories(prev => [data.story, ...prev]);
        setStoryTitle("");
        setStoryContent("");
        setStorySuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingStory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-display font-extrabold text-slate-900">Publish Success Stories & Pitch Achievements</h2>
        <p className="text-slate-500 text-xs">Share your board appointments, leadership breakthroughs, or corporate promotions. All stories require Administrator validation before timeline visibility.</p>
      </div>

      {storySuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-3 px-4 rounded-xl font-medium animate-pulse">
          Story submitted successfully! Once approved it will be published to the WomenPlay Network corporate pages.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handlePublishStory} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Story Title / Headline</label>
            <input type="text" required placeholder="Appointed as Non-Executive Director at Chase"
              value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Your Strategic Narrative</label>
              <button type="button" onClick={handleRefineStory} disabled={refiningStory || !storyContent.trim()}
                className="text-[10px] font-bold text-brand-pink hover:text-brand-pink-dark flex items-center space-x-1 disabled:opacity-50">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Polish with AI</span>
              </button>
            </div>
            <textarea required rows={5} placeholder="Outline your milestones, metrics, and key sponsorship links..."
              value={storyContent} onChange={(e) => setStoryContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none" />
          </div>
          <button type="submit" disabled={submittingStory}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs tracking-wider uppercase shadow-md transition">
            Submit Story to Admin
          </button>
        </form>

        <div className="bg-brand-gold-light/30 border border-brand-gold/30 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-[360px]">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold-glow opacity-30 rounded-full blur-xl" />
          <div className="space-y-3 z-10">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-gold-dark" />
              <span>AI Content Polish Recommendation</span>
            </h3>
            <div className="bg-white border border-slate-200 p-4 rounded-xl h-44 overflow-y-auto text-[11px] text-slate-700 leading-relaxed">
              {refiningStory ? (
                <div className="flex items-center space-x-2 text-brand-pink animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executive AI is polishing your narrative...</span>
                </div>
              ) : storyRefinement ? (
                <p className="whitespace-pre-line">{storyRefinement}</p>
              ) : (
                <p className="text-slate-400 italic">"Write a draft, then click 'Polish with AI' to generate a highly professional version!"</p>
              )}
            </div>
          </div>
          <button type="button" onClick={() => { if (storyRefinement) setStoryContent(storyRefinement); }}
            disabled={!storyRefinement}
            className="w-full bg-brand-pink hover:bg-brand-pink-dark text-white font-bold py-2 px-4 rounded-xl text-xs disabled:opacity-40 transition">
            Apply AI Recommendation
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">My Success Story Timeline Statuses</h3>
        {myStories.length > 0 ? (
          myStories.map((story) => (
            <div key={story.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center text-xs">
              <div>
                <h4 className="font-bold text-slate-800">{story.title}</h4>
                <p className="text-slate-400 mt-1">{new Date(story.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`py-1 px-3 rounded-full font-bold text-[10px] ${
                story.approved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {story.approved ? "Published" : "Awaiting Approval"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-xs italic">No success stories created yet.</p>
        )}
      </div>
    </div>
  );
}
