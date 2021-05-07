import { BufferReader, BufferWriter } from "./buffer";
import { DeckDefinition } from "../types";
import { DECKSTRING_VERSION, FormatType } from "./constants";

function verifyDbfId(id: any, name?: string): void {
	name = name ? name : "dbf id";
	if (!isPositiveNaturalNumber(id)) {
		throw new Error(`Invalid ${name} ${id} (expected valid dbf id)`);
	}
}

function isPositiveNaturalNumber(n: any): boolean {
	if (typeof n !== "number" || !isFinite(n)) {
		return false;
	}
	if (Math.floor(n) !== n) {
		return false;
	}
	return n > 0;
}


export function encode(deck: DeckDefinition): string {

	const writer = new BufferWriter();

	writer.null();
	writer.varint(DECKSTRING_VERSION);
	writer.varint(deck.hero);
	writer.varint(deck.deck_id);
	writer.varint(deck.skill_cards.length);
	for (let cardId of deck.skill_cards) {
		writer.varint(cardId);
	}
	writer.varint(deck.destiny_cards.length);
	for (let cardId of deck.destiny_cards) {
		writer.varint(cardId);
	}

	return writer.toString();
}

export function decode(deckstring: string): DeckDefinition {
	const reader = new BufferReader(deckstring);

	if (reader.nextByte() !== 0) {
		throw new Error("Invalid deckstring");
	}

	const version = reader.nextVarint();
	if (version !== DECKSTRING_VERSION) {
		throw new Error(`Unsupported deckstring version ${version}`);
	}

	const hero = reader.nextVarint();

	const deck_id = reader.nextVarint();

	const skill_cards: number[] = [];
	for (let j = 0, c = reader.nextVarint(); j < c; j++) {
		skill_cards.push(reader.nextVarint());
	}
	const destiny_cards: number[] = [];
	for (let j = 0, c = reader.nextVarint(); j < c; j++) {
		destiny_cards.push(reader.nextVarint());
	}

	return {
		hero,
		skill_cards,
		destiny_cards,
		deck_id,
	};
}

export { FormatType };
