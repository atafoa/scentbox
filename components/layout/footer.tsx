import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Kunbo</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Discover, log, and share your fragrance journey.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Browse</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/fragrances" className="text-muted-foreground hover:text-foreground">
                  Fragrances
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-muted-foreground hover:text-foreground">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="/notes" className="text-muted-foreground hover:text-foreground">
                  Notes
                </Link>
              </li>
              <li>
                <Link href="/lists" className="text-muted-foreground hover:text-foreground">
                  Lists
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Community</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/activity" className="text-muted-foreground hover:text-foreground">
                  Activity
                </Link>
              </li>
              <li>
                <Link href="/users" className="text-muted-foreground hover:text-foreground">
                  Members
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kunbo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
