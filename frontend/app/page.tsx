"use client";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Zap, Lock } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserMenu } from "@/components/user-menu";

export default function Landing() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex flex-col">
      <nav className="flex justify-between items-center p-6">
        <span className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-blue-500" />
          DORA : Find Faces in Videos
        </span>
        {loading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        ) : user ? (
          <UserMenu />
        ) : (
          <Button asChild size="lg" className="px-6 py-2 text-base font-semibold">
            <a href="/login">Sign In</a>
          </Button>
        )}
      </nav>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center py-20">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl mb-8 rounded-lg overflow-hidden shadow-xl">
              <div className="relative aspect-video">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/aXrYj26qwVM?autoplay=0&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&mute=0&vq=hd1080&enablejsapi=1&origin=https%3A%2F%2Fwww.2vid.ai&widgetid=1&forigin=https%3A%2F%2Fwww.2vid.ai%2F&aoriginsup=1&vf=2"
                  title="DORA Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900 text-center">
              Find Faces in Your Videos
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl text-center">
              Instantly locate specific faces in your video content. Upload a video and a reference photo to detect appearances with our advanced AI technology. Fast, private, and incredibly easy to use.
            </p>
            <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg">
              <a href={user ? "/app" : "/login"}>Get Started</a>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Choose DORA?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <Zap className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Process hours of video content in minutes with our optimized AI algorithms
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <Shield className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your data stays on your device. No cloud processing, no data sharing
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <Lock className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with accurate face detection technology
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Ready to Find Faces in Your Videos?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of users who trust DORA for their video analysis needs
            </p>
            <Button asChild size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg">
              <a href={user ? "/app" : "/login"}>{user ? "Go to App" : "Start Free Trial"}</a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-500" />
                DORA
              </h3>
              <p className="text-sm">
                Advanced face detection technology for your video content
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/features" className="hover:text-white">Features</a></li>
                <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/blog" className="hover:text-white">Blog</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © {new Date().getFullYear()} DORA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
