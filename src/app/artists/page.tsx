'use client';

import { useState, useEffect } from 'react';
import { api } from '@/trpc/react';
import type { RouterOutputs } from '@/trpc/react';

type Artist = RouterOutputs['artists']['getArtists']['artists'][0];
type ArtistCard = RouterOutputs['artists']['getArtistCards']['cards'][0];

interface ArtistCardProps {
  name: string;
  oldestCardDate: Date;
  cardCount: number;
}

function ArtistCard({ name, oldestCardDate, cardCount }: ArtistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    data: cardsData,
    isLoading: cardsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.artists.getArtistCards.useInfiniteQuery(
    {
      artistName: name,
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: isExpanded,
    },
  );

  const allCards = cardsData?.pages.flatMap((page) => page.cards) ?? [];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const loadMoreCards = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <button
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded p-2 text-left transition-colors hover:bg-amber-100"
      >
        <div>
          <h3 className="text-lg font-semibold text-amber-900">{name}</h3>
          <p className="text-sm text-amber-700">
            {cardCount} cards • First card:{' '}
            {oldestCardDate.toLocaleDateString()}
          </p>
        </div>
        <span className="text-xl text-amber-700">{isExpanded ? '▲' : '▼'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 border-t border-amber-200 pt-4">
          {cardsLoading ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-900"></div>
              <p className="mt-2 text-amber-700">Loading cards...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allCards.map((card: ArtistCard) => (
                  <div
                    key={`${card.id}${card.artOnlyUri}`}
                    className="rounded-lg border border-amber-300 bg-white p-3 transition-colors hover:bg-amber-50"
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={card.artOnlyUri}
                        alt={card.name}
                        className="h-16 w-16 rounded border object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium text-amber-900">
                          {card.name}
                        </h4>
                        <p className="text-sm text-amber-700">
                          {card.setName} ({card.set.toUpperCase()})
                        </p>
                        <p className="text-xs text-amber-600">
                          {card.releasedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasNextPage && (
                <div className="mt-4 text-center">
                  <button
                    onClick={loadMoreCards}
                    disabled={isFetchingNextPage}
                    className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load More Cards'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ArtistsPage() {
  const [lastElement, setLastElement] = useState<HTMLDivElement | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.artists.getArtists.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const allArtists = data?.pages.flatMap((page) => page.artists) ?? [];

  // Client-side deduplication as additional safety measure
  const uniqueArtists = allArtists.filter(
    (artist: Artist, index: number, self: Artist[]) =>
      self.findIndex((a) => a.name === artist.name) === index,
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!lastElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(lastElement);
    return () => observer.disconnect();
  }, [lastElement, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-amber-900"></div>
            <p className="mt-4 text-amber-700">Loading artists...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-amber-900">
            MTG Artists Directory
          </h1>
          <p className="text-amber-700">
            Discover Magic: The Gathering artists and explore their artwork
          </p>
        </div>

        <div className="space-y-4">
          {uniqueArtists.map((artist: Artist, index: number) => (
            <div
              key={artist.name}
              ref={index === uniqueArtists.length - 1 ? setLastElement : null}
            >
              <ArtistCard
                name={artist.name}
                oldestCardDate={new Date(artist.oldestCardDate)}
                cardCount={artist.cardCount}
              />
            </div>
          ))}

          {isFetchingNextPage && (
            <div className="py-4 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-amber-900"></div>
              <p className="mt-2 text-amber-700">Loading more artists...</p>
            </div>
          )}

          {!hasNextPage && uniqueArtists.length > 0 && (
            <div className="py-4 text-center text-amber-700">
              <p>You&apos;ve reached the end of the artists directory!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
