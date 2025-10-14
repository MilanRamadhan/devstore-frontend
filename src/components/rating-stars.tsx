import { Star } from "lucide-react";

export default function RatingStars({ value, count }: { value: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-600">
      <Star className="h-3.5 w-3.5 fill-yellow-400 stroke-yellow-400" />
      <span>
        {value.toFixed(1)} • {count} ulasan
      </span>
    </div>
  );
}
