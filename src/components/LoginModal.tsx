import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login process...');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Current domain:', window.location.hostname);
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful, saving user data...');
      
      await setDoc(doc(db, 'users', result.user.uid), {
        name: result.user.displayName,
        email: result.user.email,
        createdAt: new Date().toISOString()
      });

      onClose();
      toast({
        title: "Welcome!",
        description: "Successfully logged in.",
      });
    } catch (err: any) {
      console.error('Login error:', {
        code: err.code,
        message: err.message,
        domain: window.location.hostname
      });
      
      let errorMessage = 'Failed to login. Please try again.';
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = `This domain (${window.location.hostname}) is not authorized. Please contact support.`;
      }
      
      setError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-center">Welcome! Are you ready to design your next guitar?</h2>
        <Button 
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black hover:bg-gray-100 flex items-center justify-center gap-2 py-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </Button>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};