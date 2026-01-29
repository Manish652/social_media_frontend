import { X } from "lucide-react";
import { useState } from "react";

export default function EditPostModal({ isOpen, onClose, post, onSave }) {
  const [caption, setCaption] = useState(post?.caption || "");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(caption);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-900">Edit Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-full transition-all hover:scale-110 active:scale-95"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Post Preview */}
          {post?.image && (
            <div className="mb-4 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={post.image}
                alt="Post"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Caption Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="4"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
              placeholder="Write a caption..."
              autoFocus
            />
            <div className="mt-2 text-xs text-gray-500">
              {caption.length} characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
