'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { SingleValue } from 'react-select';

// Dynamically import AsyncSelect to avoid SSR hydration issues
const AsyncSelect = dynamic(() => import('react-select/async'), {
  ssr: false,
  loading: () => (
    <div className="h-[50px] animate-pulse rounded-lg bg-gray-200" />
  ),
}) as any;

interface CardOption {
  value: string;
  label: string;
}

export default function CardsPage() {
  const [selectedCard, setSelectedCard] =
    useState<SingleValue<CardOption>>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadCards = async (inputValue: string): Promise<CardOption[]> => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(inputValue)}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();

      // The API returns an object with a 'data' array containing card names
      return data.data.map((cardName: string) => ({
        value: cardName,
        label: cardName,
      }));
    } catch (error) {
      console.error('Error fetching cards:', error);
      return [];
    }
  };

  const handleCardSelect = (option: SingleValue<CardOption>) => {
    setSelectedCard(option);
    if (option) {
      console.log('Selected card:', option.label);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Magic: The Gathering Card Search
          </h1>
          <p className="text-lg text-gray-300">
            Search for any Magic card using the Scryfall database
          </p>
        </div>

        <div className="rounded-lg bg-white/10 p-8 backdrop-blur-md">
          <label
            htmlFor="card-search"
            className="mb-4 block text-lg font-semibold text-white"
          >
            Search for a card:
          </label>

          <AsyncSelect<CardOption>
            id="card-search"
            cacheOptions
            loadOptions={loadCards}
            defaultOptions={false}
            value={selectedCard}
            onChange={handleCardSelect}
            placeholder="Type at least 2 characters to search..."
            noOptionsMessage={({ inputValue }: { inputValue: string }) =>
              inputValue.length < 2
                ? 'Type at least 2 characters to search'
                : 'No cards found'
            }
            loadingMessage={() => 'Searching cards...'}
            className="text-black"
            styles={{
              control: (provided: any) => ({
                ...provided,
                minHeight: '50px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '2px solid #e5e7eb',
                '&:hover': {
                  border: '2px solid #3b82f6',
                },
                '&:focus-within': {
                  border: '2px solid #3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              }),
              placeholder: (provided: any) => ({
                ...provided,
                color: '#6b7280',
              }),
              menu: (provided: any) => ({
                ...provided,
                borderRadius: '8px',
                marginTop: '4px',
              }),
              option: (provided: any, state: any) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? '#3b82f6'
                  : state.isFocused
                    ? '#e0e7ff'
                    : 'white',
                color: state.isSelected ? 'white' : '#374151',
                padding: '12px 16px',
                cursor: 'pointer',
              }),
            }}
          />

          {selectedCard && (
            <div className="mt-6 rounded-lg bg-white/20 p-4">
              <h3 className="text-lg font-semibold text-white">
                Selected Card:
              </h3>
              <p className="text-xl text-blue-200">{selectedCard.label}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Card data provided by{' '}
            <a
              href="https://scryfall.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Scryfall
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
