import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3 px-1">
      <Image
        src="/logo.png"
        alt=""
        width={52}
        height={52}
        className="h-[52px] w-[52px] shrink-0 object-contain"
        priority
      />
      <span className="logo-title shrink-0 whitespace-nowrap">HideAway 57</span>
    </Link>
  );
}
