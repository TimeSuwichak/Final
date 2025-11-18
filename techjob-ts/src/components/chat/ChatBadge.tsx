// src/components/chat/ChatBadge.tsx
export function ChatBadge({ count }: { count: number }) {
  if (!count || count === 0) return null;

  return (
    <span className="
      ml-auto bg-red-600 text-white text-xs 
      rounded-full px-2 py-0.5
    ">
      {count}
    </span>
  );
}
