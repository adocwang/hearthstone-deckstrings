export type FormatType = 1 | 2 | 3;

export interface DeckDefinition {
	skill_cards: number[];
	destiny_cards: number[];
	hero: number;
	deck_id: number;
}

export function encode(deck: DeckDefinition): string;

export function decode(deckstring: string): DeckDefinition;
