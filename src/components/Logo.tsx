import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo-mascot.png"
        alt=""
        width={36}
        height={36}
        className="rounded-sm object-contain"
      />
      <span
        className="text-lg font-black uppercase tracking-wide"
        style={{ color: "var(--pink)" }}
      >
        HideAway 57
      </span>
    </Link>
  );
}
