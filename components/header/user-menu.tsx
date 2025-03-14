import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface UserMenuProps {
  onClose: () => void;
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export function UserMenu({ onClose }: UserMenuProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  // Check if user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data from the server
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Failed to fetch user data', err);
      localStorage.removeItem('token');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la solicitud de inicio de sesión:', errorData);
        throw new Error('Login request failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      // Set user data from response
      setUserData({
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar,
      });

      setIsLoggedIn(true);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Unable to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserData(null);
      router.push('/');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError('Unable to log out. Please try again.');
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <Card className="absolute right-0 top-10 w-80 z-50">
      <CardHeader className="relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        {isLoggedIn ? (
          <CardTitle>My Account</CardTitle>
        ) : (
          <>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </>
        )}
      </CardHeader>

      {isLoggedIn && userData ? (
        <>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{userData.name}</span>
                <span className="text-sm text-muted-foreground">{userData.email}</span>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <span className="sr-only">Status:</span>
                  Online
                </span>
              </div>
            </div>
            <Separator />
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleGoToDashboard}>
              Dashboard
            </Button>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </>
      ) : (
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Implement registration flow
                console.log('Register clicked');
              }}
            >
              Create Account
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
