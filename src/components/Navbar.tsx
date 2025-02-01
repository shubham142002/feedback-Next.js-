'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { Menu } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-background border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] bg-clip-text text-transparent animate-gradient">
                True Feedback
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <>
                <span className="text-muted-foreground">
                  Welcome, <span className="font-medium text-foreground">{user.username || user.email}</span>
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="transition-all duration-300 hover:scale-105 text-white hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-x-4">
                <Link href="/sign-in">
                  <Button 
                    variant="outline"
                    className="transition-all duration-300 hover:scale-105 border-[#2C786C] hover:bg-[#2C786C]/10 text-foreground hover:text-foreground"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    className="relative bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] hover:opacity-90 transition-all duration-300 hover:scale-105 animate-gradient text-white hover:text-white [&>span]:relative [&>span]:z-10 before:absolute before:inset-0 before:bg-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {session ? (
              <>
                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="w-full text-white hover:text-white"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2 p-2">
                <Link href="/sign-in">
                  <Button 
                    variant="outline" 
                    className="w-full text-foreground hover:text-foreground"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button 
                    className="w-full relative bg-gradient-to-r from-[#0A2647] via-[#2C786C] to-[#FFD700] text-white hover:text-white [&>span]:relative [&>span]:z-10 before:absolute before:inset-0 before:bg-black/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                  >
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
