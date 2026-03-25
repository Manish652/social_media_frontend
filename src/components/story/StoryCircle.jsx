export default function StoryCircle({ story, onClick }) {
  const displayName = story.isCurrentUser ? "Your Story" : story.username;

  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={() => onClick?.(story)}
    >
      <div
        className={`avatar ${story.hasStory ? "ring ring-primary ring-offset-base-100 ring-offset-2" : ""}`}
      >
        <div className={`w-14 h-14 rounded-full ${story.hasStory ? "ring ring-secondary ring-offset-base-100 ring-offset-2" : ""}`}>
          <img
            src={story.avatar}
            alt={story.username}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <p className="text-xs mt-1 text-base-content truncate w-16 text-center">
        {displayName}
      </p>
    </div>
  );
}
