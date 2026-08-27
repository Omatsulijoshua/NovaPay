import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Button from '../components/Button';
import AccountNumber from '../components/AccountNumber';
import { User, Mail, Calendar, Key, CheckCircle, LogOut } from 'lucide-react';

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Profile Edit states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [editMode, setEditMode] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Password Change states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(false);

    if (!fullName.trim()) {
      setEditError('Name cannot be empty.');
      return;
    }

    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', profile?.id);

      if (error) {
        setEditError(error.message);
      } else {
        setEditSuccess(true);
        setEditMode(false);
        await refreshProfile();
        setTimeout(() => setEditSuccess(false), 3000);
      }
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (!password || !confirmPassword) {
      setPwError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setPwError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess(true);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwSuccess(false), 3000);
      }
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>

      {/* Account Info Details Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        {editSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Profile name updated successfully!</span>
          </div>
        )}

        {editMode ? (
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={editLoading}
              required
            />
            {editError && <p className="text-xs text-rose-500 font-semibold">{editError}</p>}
            <div className="flex space-x-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={editLoading} className="py-2">
                Cancel
              </Button>
              <Button type="submit" loading={editLoading} className="py-2">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Full Name</span>
              <span className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <User className="h-4 w-4 text-slate-400" />
                <span>{profile?.full_name}</span>
              </span>
            </div>
            <button
              onClick={() => {
                setFullName(profile?.full_name || '');
                setEditMode(true);
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 p-1"
              type="button"
            >
              Edit
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
          <span className="text-sm font-bold text-slate-700 flex items-center space-x-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{profile?.email || 'N/A'}</span>
          </span>
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Number</span>
            <AccountNumber value={profile?.account_number || ''} showCopy={true} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Member Since</span>
          <span className="text-sm font-bold text-slate-700 flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{memberSince}</span>
          </span>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
          <Key className="h-4 w-4" />
          <span>Change Password</span>
        </h3>

        {pwSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Password updated successfully!</span>
          </div>
        )}

        {pwError && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
            {pwError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            id="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pwLoading}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={pwLoading}
            required
          />

          <Button type="submit" loading={pwLoading} fullWidth variant="secondary">
            Change Password
          </Button>
        </form>
      </div>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 py-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 active:scale-95 transition-all text-rose-600 font-bold text-xs rounded-2xl shadow-xs"
        type="button"
      >
        <LogOut className="h-4.5 w-4.5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}
