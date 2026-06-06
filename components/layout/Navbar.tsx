"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import { SiSteam, SiDiscord } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";

const NAV_LINKS = [
  { href: "/forum", label: "Forum" },
  { href: "/lfg", label: "Find Teammates" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const providerIcon =
    session?.user?.provider === "discord" ? (
      <SiDiscord className="text-[#5865f2] w-3 h-3" />
    ) : session?.user?.provider === "steam" ? (
      <SiSteam className="text-[#a0c4e4] w-3 h-3" />
    ) : (
      <FcGoogle className="w-3 h-3" />
    );

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
            <span className="font-display text-white text-lg leading-none">G</span>
          </div>
          <span className="font-display text-xl text-text tracking-wider hidden sm:block">
            GAMER<span className="text-accent">HELP</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-text-dim hover:text-text hover:bg-surface transition-colors text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/forum/new"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-dim text-white text-sm font-semibold rounded-md shadow-glow-sm hover:shadow-glow transition-all"
              >
                + New Post
              </Link>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface transition-colors"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-panel border border-border">
                    {session.user.image ? (
                      <Image src={session.user.image} alt="avatar" fill className="object-cover" />
                    ) : (
                      <span className="text-xs flex items-center justify-center h-full text-text-dim">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 bg-bg rounded-full p-0.5">
                      {providerIcon}
                    </div>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-text max-w-[100px] truncate">
                    {session.user.name}
                  </span>
                  <FiChevronDown className="text-text-dim w-3 h-3" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-panel border border-border rounded-lg shadow-panel overflow-hidden animate-fade-up">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-surface transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FiUser className="w-4 h-4 text-text-dim" /> My Profile
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-surface transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 text-text-dim" /> Settings
                    </Link>
                    <div className="h-px bg-border" />
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent hover:bg-surface transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-dim text-white text-sm font-semibold rounded-md shadow-glow-sm hover:shadow-glow transition-all"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-surface transition-colors text-text-dim"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-bg px-4 py-3 flex flex-col gap-1 animate-fade-up">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-text-dim hover:text-text hover:bg-surface transition-colors text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {session && (
            <Link
              href="/forum/new"
              className="mt-1 px-3 py-2 bg-accent text-white text-sm font-semibold rounded-md text-center"
              onClick={() => setMenuOpen(false)}
            >
              + New Post
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
