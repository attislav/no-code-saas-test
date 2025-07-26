"use client"

import Link from "next/link"
import { Menu, X, User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/common/theme-toggle"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { useAuth } from "@/contexts/auth-context"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut, isLoading } = useAuth()

  const navigation = [
    { name: "Geschichte erstellen", href: "/story-generator" },
    ...(user ? [{ name: "Meine Geschichten", href: "/my-stories" }] : []),
  ]

  const storyCategories = [
    { name: "Alle Geschichten", href: "/stories" },
    { name: "Abenteuer", href: "/kategorie/Abenteuer" },
    { name: "Märchen", href: "/kategorie/Märchen" },
    { name: "Lerngeschichte", href: "/kategorie/Lerngeschichte" },
    { name: "Gute-Nacht-Geschichte", href: "/kategorie/Gute-Nacht-Geschichte" },
    { name: "Freundschaftsgeschichte", href: "/kategorie/Freundschaftsgeschichte" },
    { name: "Tiergeschichte", href: "/kategorie/Tiergeschichte" },
    { name: "Traumreise", href: "/kategorie/Traumreise" },
  ]

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary hover:bg-muted/50 px-3 py-2 rounded-md"
            >
              {item.name}
            </Link>
          ))}
          
          {/* Geschichten Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium px-3 py-2 h-auto">
                Geschichten
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {storyCategories.map((category) => (
                <DropdownMenuItem key={category.name} asChild>
                  <Link href={category.href}>
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {profile?.display_name || user.email?.split('@')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="h-4 w-4 mr-2" />
                    Account-Einstellungen
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <AuthDialog defaultMode="login">
                <Button variant="ghost">Anmelden</Button>
              </AuthDialog>
              <AuthDialog defaultMode="register">
                <Button>Kostenlos starten</Button>
              </AuthDialog>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="font-bold text-xl">{APP_NAME}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Geschichten Section in Mobile */}
                <div className="pt-2">
                  <div className="text-sm font-medium text-muted-foreground py-2">Geschichten</div>
                  {storyCategories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-sm font-medium transition-colors hover:text-primary py-2 pl-4 block"
                      onClick={() => setIsOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </nav>
              
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-9 bg-muted animate-pulse rounded-md" />
                    <div className="h-9 bg-muted animate-pulse rounded-md" />
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 text-sm">
                      <User className="h-4 w-4" />
                      {profile?.display_name || user.email?.split('@')[0]}
                    </div>
                    <Button 
                      variant="ghost" 
                      className="justify-start w-full"
                      asChild
                    >
                      <Link href="/account" onClick={() => setIsOpen(false)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Account-Einstellungen
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="justify-start w-full"
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Abmelden
                    </Button>
                  </div>
                ) : (
                  <>
                    <AuthDialog defaultMode="login">
                      <Button variant="ghost" className="justify-start w-full">
                        Anmelden
                      </Button>
                    </AuthDialog>
                    <AuthDialog defaultMode="register">
                      <Button className="w-full">
                        Kostenlos starten
                      </Button>
                    </AuthDialog>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 