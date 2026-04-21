import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { TIER_LEVELS, TIER_META, type TierLevel } from "@/lib/tiers";

export function CreateUserForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
    tier: 'papers_taker' as TierLevel,
    syncToGrowingAge: true,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
    toast({ title: "Password Generated", description: "A secure password has been generated." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({ title: "Error", description: "Email and password are required", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user-account', {
        body: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          tier: formData.tier,
          syncToGrowingAge: formData.syncToGrowingAge,
        }
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const syncMsg = formData.syncToGrowingAge
        ? (data?.growingAge?.success
          ? ' Also created on growing-age-calculator.'
          : ` Growing-age sync failed: ${data?.growingAge?.error ?? 'unknown error'}`)
        : '';

      toast({
        title: "Success",
        description: `User account created for ${formData.email}.${syncMsg}`,
      });

      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        displayName: '',
        tier: 'papers_taker',
        syncToGrowingAge: true,
      });

      window.dispatchEvent(new CustomEvent('userCreated'));

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Create User Account
        </CardTitle>
        <CardDescription>
          Create a new user account with email, password, and access tier. Optionally mirrors to growing-age-calculator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="displayName">Display Name (Optional)</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="Auto-generates from first/last name if empty"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
            <p className="text-micro text-muted-foreground mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <Label htmlFor="tier">Access Tier *</Label>
            <Select
              value={formData.tier}
              onValueChange={(value) => handleInputChange('tier', value)}
            >
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {TIER_LEVELS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIER_META[t].label} — {TIER_META[t].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/30 p-3">
            <Checkbox
              id="syncToGrowingAge"
              checked={formData.syncToGrowingAge}
              onCheckedChange={(checked) => handleInputChange('syncToGrowingAge', Boolean(checked))}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <Label htmlFor="syncToGrowingAge" className="cursor-pointer">
                Also create on growing-age-calculator
              </Label>
              <p className="text-xs text-muted-foreground">
                Creates the same email/password on Financial Presenters (role: consultant, approved).
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create User Account"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
