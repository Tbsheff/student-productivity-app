import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { User, UserCircle, BookOpen, Calendar, BarChart2 } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" prefetch className="text-xl font-bold text-indigo-600">
            StudySmart AI
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="#features"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            How It Works
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600"
          >
            Testimonials
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
