import React, { useEffect, useMemo, useState } from "react";
import { listComments, addComment, deleteComment } from "../utils/tripstore";

export default function SectionComments({ tripId, sectionKey, user }) {
  const displayUser = useMemo(() => {
    const name = user?.name || user?.nickname || "Traveler";
    return {
      userId: user?.sub || "anon",
      userName: name,
      avatarUrl: user?.picture || ""
    };
  }, [user]);

  const [comments, setComments] = useState(() => listComments(tripId, sectionKey));
  const [text, setText] = useState("");

  // Live-update when storage changes (another tab or area in app)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "trips.v1") setComments(listComments(tripId, sectionKey));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [tripId, sectionKey]);

  const handlePost = () => {
    const created = addComment(tripId, sectionKey, {
      ...displayUser,
      text
    });
    if (created) {
      setText("");
      setComments(listComments(tripId, sectionKey));
    }
  };

  const handleDelete = (id) => {
    deleteComment(tripId, sectionKey, id);
    setComments(listComments(tripId, sectionKey));
  };

  return (
    <div className="mt-6 rounded-xl border border-[#e7e7e7] p-4 bg-white/70">
      <h4 className="text-sm font-semibold mb-3">Comments</h4>

      {comments.length === 0 ? (
        <p className="text-[13px] text-gray-500 mb-3">No comments yet.</p>
      ) : (
        <ul className="space-y-3 mb-4">
          {comments
            .slice()
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.userName}
                    className="w-8 h-8 rounded-full object-cover mt-0.5"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 mt-0.5" />
                )}

                <div className="flex-1">
                  <div className="text-[13px]">
                    <span className="font-medium">{c.userName}</span>{" "}
                    <span className="text-gray-400">
                      • {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[14px] whitespace-pre-wrap">{c.text}</div>
                </div>

                {/* Simple delete for now (no auth rules yet) */}
                <button
                  className="text-xs text-red-500 hover:underline"
                  onClick={() => handleDelete(c.id)}
                  aria-label="Delete comment"
                  title="Delete comment"
                >
                  Delete
                </button>
              </li>
            ))}
        </ul>
      )}

      <div className="flex items-start gap-3">
        {displayUser.avatarUrl ? (
          <img
            src={displayUser.avatarUrl}
            alt={displayUser.userName}
            className="w-8 h-8 rounded-full object-cover mt-1"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 mt-1" />
        )}
        <div className="flex-1">
          <textarea
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
            rows={3}
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm rounded-lg border"
              onClick={() => setText("")}
              type="button"
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-sm rounded-lg bg-[#F4A482] text-white hover:opacity-90"
              onClick={handlePost}
              type="button"
              disabled={!text.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}