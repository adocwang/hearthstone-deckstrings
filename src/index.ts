import {BufferReader, BufferWriter} from "./buffer";

export interface DeckDefinition {
	cards: number[];
	heroes: number[];
	format: 1 | 2;
}

const DECKSTRING_VERSION = 1;

function trisort_cards(cards): any {
	const single = [], double = [], n = [];
	for (const tuple of cards) {
		let list;
		const [card, count] = tuple;
		if (count === 1) {
			list = single;
		}
		else if (count === 2) {
			list = double;
		}
		else {
			list = n;
		}
		list.push(tuple);
	}
	return [
		single,
		double,
		n,
	];
}

export function encode(deck: DeckDefinition): string {
	const writer = new BufferWriter();

	writer.null();
	writer.varint(DECKSTRING_VERSION);
	writer.varint(deck.format);
	writer.varint(deck.heroes.length);
	for (let hero of deck.heroes) {
		writer.varint(hero);
	}

	for (let list of trisort_cards(deck.cards)) {
		writer.varint(list.length);
		for (let tuple of list) {
			const [card, count] = tuple;
			writer.varint(card);
			if (count !== 1 && count !== 2) {
				writer.varint(count);
			}
		}
	}

	return writer.toString();
}

export function decode(deckstring: string): DeckDefinition {
	const reader = new BufferReader(deckstring);

	if (reader.nextByte() !== 0) {
		throw new Error("Invalid deckstring");
	}

	if (reader.nextVarint() !== DECKSTRING_VERSION) {
		throw new Error(`Unsupported deckstring version {$version}`);
	}

	const format = reader.nextVarint();
	if (format !== 1 && format !== 2) {
		throw new Error(`Unsupported format ${format} in deckstring`);
	}

	const heroes = new Array(reader.nextVarint());
	for (let i = 0; i < heroes.length; i++) {
		heroes[i] = reader.nextVarint();
	}

	const cards = [];
	for (let i = 1; i <= 3; i++) {
		for (let i = 0, c = reader.nextVarint(); i < c; i++) {
			cards.push([reader.nextVarint(), (i === 1 || i === 2) ? i : reader.nextVarint()]);
		}
	}

	return {
		cards,
		heroes,
		format,
	};
}