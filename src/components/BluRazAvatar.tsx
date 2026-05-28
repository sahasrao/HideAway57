import Image from "next/image";
import { avatarImageFilter, DEFAULT_AVATAR_BODY } from "@/lib/avatar-theme";

export const BLURAZ_AVATAR_SRC = "/bluraz-avatar.png";

type BluRazAvatarProps = {
  bodyColor?: string;
  size?: number;
  className?: string;
};

/** Official BluRaz PNG — color shifts via CSS filter when users pick a theme. */
export function BluRazAvatar({
  bodyColor = DEFAULT_AVATAR_BODY,
  size = 112,
  className = "",
}: BluRazAvatarProps) {
  return (
    <Image
      src={BLURAZ_AVATAR_SRC}
      alt=""
      width={size}
      height={size}
      unoptimized
      aria-hidden
      className={`object-contain ${className}`}
      style={{
        width: size,
        height: size,
        filter: avatarImageFilter(bodyColor),
      }}
    />
  );
}
