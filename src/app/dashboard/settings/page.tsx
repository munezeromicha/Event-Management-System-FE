"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface Settings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
  profile: {
    name: string;
    email: string;
    phone: string;
    organization: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      organization: 'RNIT',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value,
      },
    }));
  };

  const handleNotificationChange = (key: keyof Settings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');
      
      // Show success message
      alert('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-10 divide-y divide-gray-900/10">
        {/* Profile Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Profile</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Update your personal information.
            </p>
          </div>

          <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={settings.profile.name}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  type="email"
                  label="Email"
                  name="email"
                  value={settings.profile.email}
                  onChange={handleProfileChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={settings.profile.phone}
                  onChange={handleProfileChange}
                />
                <Input
                  label="Organization"
                  name="organization"
                  value={settings.profile.organization}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Notifications Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Configure how you receive notifications.
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-6 sm:p-8">
              <div className="space-y-4">
                <Checkbox
                  label="Email Notifications"
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                <Checkbox
                  label="Push Notifications"
                  checked={settings.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                <Checkbox
                  label="SMS Notifications"
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Security</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Manage your security preferences.
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-6 sm:p-8">
              <div className="space-y-4">
                <Checkbox
                  label="Enable Two-Factor Authentication"
                  name="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onChange={handleSecurityChange}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionTimeout"
                    value={settings.security.sessionTimeout}
                    onChange={handleSecurityChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-x-6 pt-10">
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
} 