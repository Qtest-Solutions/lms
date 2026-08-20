interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-body-sm",
  md: "w-10 h-10 text-body-sm",
  lg: "w-12 h-12 text-headline-md",
  xl: "w-16 h-16 text-headline-md",
};

const colors = [
  "bg-primary text-on-primary",
  "bg-secondary text-on-secondary",
  "bg-[#1a1930] text-[#c7c3e2]",
  "bg-[#271905] text-[#fcdebd]",
];

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colorIndex = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-[var(--radius-full)] object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-[var(--radius-full)] font-semibold ${colors[colorIndex]} ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
}