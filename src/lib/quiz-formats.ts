import type { Prisma } from '@prisma/client';

export enum QuizFormatType {
  DATE_RANGE = 'DATE_RANGE',
  SET_TYPE = 'SET_TYPE',
  COLOR = 'COLOR',
  CUSTOM = 'CUSTOM',
}

export interface DateRangeFilter {
  type: QuizFormatType.DATE_RANGE;
  releasedAfter?: Date;
  releasedBefore?: Date;
}

export interface SetTypeFilter {
  type: QuizFormatType.SET_TYPE;
  setTypes: string[];
}

export interface ColorFilter {
  type: QuizFormatType.COLOR;
  colors: string[];
  includeColorless?: boolean;
}

export interface CustomFilter {
  type: QuizFormatType.CUSTOM;
  whereClause: Prisma.CardWhereInput;
}

export type FormatFilter =
  | DateRangeFilter
  | SetTypeFilter
  | ColorFilter
  | CustomFilter;

export interface QuizFormat {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly filters: FormatFilter[];
  readonly isActive: boolean;
}

// Define quiz formats with better composition and type safety
export const QUIZ_FORMATS: readonly QuizFormat[] = [
  {
    id: 'classic',
    name: 'Classic Format',
    description: 'Cards released before 1996 - the original Magic experience',
    filters: [
      {
        type: QuizFormatType.DATE_RANGE,
        releasedBefore: new Date('1996-01-01'),
      },
    ],
    isActive: true,
  },
  {
    id: 'modern',
    name: 'Modern Format',
    description: 'Cards from 2003 onwards - competitive Modern format',
    filters: [
      {
        type: QuizFormatType.DATE_RANGE,
        releasedAfter: new Date('2003-07-28'),
      },
    ],
    isActive: true,
  },
  {
    id: 'recent',
    name: 'Recent Cards',
    description: 'Cards from the last 5 years',
    filters: [
      {
        type: QuizFormatType.DATE_RANGE,
        releasedAfter: new Date(new Date().getFullYear() - 5, 0, 1),
      },
    ],
    isActive: true,
  },
  {
    id: 'vintage',
    name: 'Vintage Collection',
    description: 'All cards throughout Magic history',
    filters: [], // No filters - includes all cards
    isActive: true,
  },
  {
    id: 'core-sets',
    name: 'Core Sets Only',
    description: 'Cards from core sets and basic sets',
    filters: [
      {
        type: QuizFormatType.SET_TYPE,
        setTypes: ['core', 'starter'],
      },
    ],
    isActive: true,
  },
  {
    id: 'multicolor',
    name: 'Multicolor Cards',
    description: 'Cards with multiple colors',
    filters: [
      {
        type: QuizFormatType.CUSTOM,
        whereClause: {
          colors: {
            isEmpty: false,
          },
          AND: {
            OR: [
              { colors: { hasEvery: ['W', 'U'] } },
              { colors: { hasEvery: ['W', 'B'] } },
              { colors: { hasEvery: ['W', 'R'] } },
              { colors: { hasEvery: ['W', 'G'] } },
              { colors: { hasEvery: ['U', 'B'] } },
              { colors: { hasEvery: ['U', 'R'] } },
              { colors: { hasEvery: ['U', 'G'] } },
              { colors: { hasEvery: ['B', 'R'] } },
              { colors: { hasEvery: ['B', 'G'] } },
              { colors: { hasEvery: ['R', 'G'] } },
            ],
          },
        },
      },
    ],
    isActive: false, // Can enable later when ready
  },
] as const;

// Build Prisma where clause from format filters
export function buildFormatWhereClause(
  format: QuizFormat,
): Prisma.CardWhereInput {
  if (format.filters.length === 0) {
    return {}; // No filters means all cards
  }

  const conditions: Prisma.CardWhereInput[] = [];

  for (const filter of format.filters) {
    switch (filter.type) {
      case QuizFormatType.DATE_RANGE: {
        const dateCondition: Prisma.CardWhereInput = {};
        if (filter.releasedAfter || filter.releasedBefore) {
          dateCondition.releasedAt = {};
          if (filter.releasedAfter) {
            dateCondition.releasedAt.gte = filter.releasedAfter;
          }
          if (filter.releasedBefore) {
            dateCondition.releasedAt.lt = filter.releasedBefore;
          }
        }
        conditions.push(dateCondition);
        break;
      }

      case QuizFormatType.SET_TYPE: {
        conditions.push({
          setType: {
            in: filter.setTypes,
          },
        });
        break;
      }

      case QuizFormatType.COLOR: {
        const colorCondition: Prisma.CardWhereInput = {};
        if (filter.colors.length > 0) {
          colorCondition.colors = {
            hasSome: filter.colors,
          };
        }
        if (filter.includeColorless) {
          colorCondition.OR = [colorCondition, { colors: { isEmpty: true } }];
        }
        conditions.push(colorCondition);
        break;
      }

      case QuizFormatType.CUSTOM: {
        conditions.push(filter.whereClause);
        break;
      }
    }
  }

  // Combine all conditions with AND
  return conditions.length === 1 ? conditions[0]! : { AND: conditions };
}

// Helper functions with better error handling and validation
export function getFormatById(formatId: string): QuizFormat {
  const format = QUIZ_FORMATS.find((f) => f.id === formatId && f.isActive);
  if (!format) {
    throw new Error(`Quiz format '${formatId}' not found or not active`);
  }
  return format;
}

export function getAllActiveFormats(): QuizFormat[] {
  return QUIZ_FORMATS.filter((f) => f.isActive);
}

export function getAllFormats(): QuizFormat[] {
  return [...QUIZ_FORMATS];
}

// Validation function to ensure format is properly configured
export function validateFormat(format: QuizFormat): boolean {
  if (!format.id || !format.name || !format.description) {
    return false;
  }

  // Validate each filter
  for (const filter of format.filters) {
    switch (filter.type) {
      case QuizFormatType.DATE_RANGE: {
        if (
          filter.releasedAfter &&
          filter.releasedBefore &&
          filter.releasedAfter >= filter.releasedBefore
        ) {
          return false; // Invalid date range
        }
        break;
      }
      case QuizFormatType.SET_TYPE: {
        if (!filter.setTypes || filter.setTypes.length === 0) {
          return false; // Must have at least one set type
        }
        break;
      }
      case QuizFormatType.COLOR: {
        if (!filter.colors || filter.colors.length === 0) {
          return false; // Must have at least one color
        }
        break;
      }
    }
  }

  return true;
}

// Type-safe format summary for API responses
export interface QuizFormatSummary {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export function formatToSummary(format: QuizFormat): QuizFormatSummary {
  return {
    id: format.id,
    name: format.name,
    description: format.description,
    isActive: format.isActive,
  };
}
