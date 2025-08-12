'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Country } from '@/types';
import { cn } from '@/lib/utils';

interface CountrySelectorProps {
  countries: Country[];
  selectedCountry: Country | null;
  onSelect: (country: Country) => void;
  error?: string;
}

export function CountrySelector({ countries, selectedCountry, onSelect, error }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = countries.filter(country =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  );

  const getDialCode = (country: Country) => {
    return country.idd.root + (country.idd.suffixes?.[0] || '');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white',
          error && 'border-red-500 focus:ring-red-500'
        )}
      >
        <div className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <span className="text-lg">{selectedCountry.flag}</span>
              <span>{getDialCode(selectedCountry)}</span>
              <span className="text-gray-500">({selectedCountry.name.common})</span>
            </>
          ) : (
            <span className="text-gray-500">Select country</span>
          )}
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
          <div className="px-3 py-2">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredCountries.map((country) => (
            <button
              key={country.cca2}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                onSelect(country);
                setIsOpen(false);
                setSearch('');
              }}
            >
              <span className="text-lg">{country.flag}</span>
              <span>{getDialCode(country)}</span>
              <span className="text-gray-600 dark:text-gray-300">{country.name.common}</span>
            </button>
          ))}
        </div>
      )}

      {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
    </div>
  );
}