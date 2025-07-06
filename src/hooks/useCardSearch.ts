import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

export interface CardSearchResult {
  value: string;
  label: string;
}

export function useCardSearch() {
  const [cardNames, setCardNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize fuse.js with card names
  const fuse = useMemo(() => {
    if (cardNames.length === 0) return null;

    return new Fuse(cardNames, {
      threshold: 0.3, // Fuzzy matching threshold
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
    });
  }, [cardNames]);

  // Load card names from JSON file
  useEffect(() => {
    async function loadCardNames() {
      try {
        setIsLoading(true);
        const response = await fetch('/card-names.json');

        if (!response.ok) {
          throw new Error(`Failed to load card names: ${response.statusText}`);
        }

        const names = (await response.json()) as string[];
        setCardNames(names);
        setError(null);
      } catch (err) {
        console.error('Error loading card names:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load card names',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCardNames();
  }, []);

  // Search function
  const searchCards = (query: string, limit = 20): CardSearchResult[] => {
    if (!fuse || !query || query.length < 2) {
      return [];
    }

    // Use fuse.js to search
    const results = fuse.search(query, { limit });

    return results.map((result) => ({
      value: result.item,
      label: result.item,
    }));
  };

  return {
    searchCards,
    isLoading,
    error,
    cardCount: cardNames.length,
  };
}
