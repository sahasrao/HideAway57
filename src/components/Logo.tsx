import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="HideAway 57 home"
      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5"
    >
      <Image
        src="/logo.png"
        alt=""
        width={156}
        height={156}
        className="h-[52px] w-[52px] shrink-0 object-contain"
        unoptimized
        priority
        aria-hidden
      />
      <span className="flex h-[52px] items-center">
        <span className="logo-title">HideAway 57</span>
      </span>
    </Link>
  );
}
