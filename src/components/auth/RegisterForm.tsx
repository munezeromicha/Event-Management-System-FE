import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  organization: string;
  acceptTerms: boolean;
}

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  organization?: string;
  acceptTerms?: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    organization: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<RegisterFormData> = {};

    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }


    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.nationalId) newErrors.nationalId = 'National ID is required';
    if (!formData.organization) newErrors.organization = 'Organization is required';
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors as RegisterFormErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        name="fullName"
        id="fullName"
        autoComplete="name"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        disabled={isLoading}
        required
      />

      <Input
        label="Email address"
        type="email"
        name="email"
        id="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        disabled={isLoading}
        required
      />

      <Input
        label="Phone Number"
        type="tel"
        name="phoneNumber"
        id="phoneNumber"
        autoComplete="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        error={errors.phoneNumber}
        disabled={isLoading}
        required
      />

      <Input
        label="National ID"
        type="text"
        name="nationalId"
        id="nationalId"
        value={formData.nationalId}
        onChange={handleChange}
        error={errors.nationalId}
        disabled={isLoading}
        required
      />

      <Input
        label="Organization"
        type="text"
        name="organization"
        id="organization"
        value={formData.organization}
        onChange={handleChange}
        error={errors.organization}
        disabled={isLoading}
        required
      />

      <div className="space-y-2">
        <Checkbox
          name="acceptTerms"
          id="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
          label="I accept the terms and conditions"
          error={errors.acceptTerms}
          disabled={isLoading}
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>
  );
} 