'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { phoneSchema, PhoneFormData } from '@/lib/validations';
import { useAuthStore } from '@/lib/store';
import { Country } from '@/types';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Phone, ChevronDown } from 'lucide-react';

export default function LoginForm() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showCountries, setShowCountries] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);
  
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag,cca2');
      const data: Country[] = await response.json();
      
      // Filter countries with valid phone codes and sort by name
      const validCountries = data
        .filter(country => country.idd?.root && country.idd?.suffixes?.length > 0)
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      setCountries(validCountries);
      
      // Set default to India or first country
      const defaultCountry = validCountries.find(c => c.cca2 === 'IN') || validCountries[0];
      if (defaultCountry) {
        setSelectedCountry(defaultCountry);
        setValue('countryCode', getCountryCode(defaultCountry));
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      // Fallback data
      const fallbackCountries = [
        { name: { common: 'India' }, idd: { root: '+91', suffixes: [''] }, flag: '🇮🇳', cca2: 'IN' },
        { name: { common: 'United States' }, idd: { root: '+1', suffixes: [''] }, flag: '🇺🇸', cca2: 'US' },
      ];
      setCountries(fallbackCountries);
      setSelectedCountry(fallbackCountries[0]);
      setValue('countryCode', '+91');
    } finally {
      setLoadingCountries(false);
    }
  };

  const getCountryCode = (country: Country): string => {
    return country.idd.root + (country.idd.suffixes[0] || '');
  };

  const onSubmit = (data: PhoneFormData) => {
    login(data.phone, data.countryCode);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setValue('countryCode', getCountryCode(country));
    setShowCountries(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Country</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCountries(!showCountries)}
            disabled={loadingCountries}
            className="w-full flex items-center justify-between p-3 border border-input rounded-md bg-background hover:bg-accent transition-colors"
          >
            <div className="flex items-center space-x-3">
              {selectedCountry && (
                <>
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm">{selectedCountry.name.common}</span>
                  <span className="text-sm text-muted-foreground">
                    {getCountryCode(selectedCountry)}
                  </span>
                </>
              )}
              {!selectedCountry && loadingCountries && (
                <span className="text-sm text-muted-foreground">Loading countries...</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {showCountries && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.cca2}
                  type="button"
                  onClick={() => selectCountry(country)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-accent transition-colors text-left"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm flex-1">{country.name.common}</span>
                  <span className="text-sm text-muted-foreground">
                    {getCountryCode(country)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.countryCode && (
          <div className="text-sm text-destructive">{errors.countryCode.message}</div>
        )}
      </div>

      <Input
        {...register('phone')}
        label="Phone Number"
        placeholder="Enter your phone number"
        leftIcon={<Phone className="h-4 w-4 text-muted-foreground" />}
        error={errors.phone?.message}
      />

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
        disabled={!selectedCountry}
      >
        Send OTP
      </Button>
    </form>
  );
}