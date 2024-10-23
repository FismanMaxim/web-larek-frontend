export class PricePrinter {
	static print(price: number) {
		if (price == 0) return 'бесценно';

		const mod10 = price % 10;
		const mod100 = price % 100;

		let word: string;
		if (mod100 >= 11 && mod100 <= 14) word = 'синапсов';
		else if (mod10 == 1) word = 'синапс';
		else if (mod10 >= 2 && mod10 <= 4) word = 'синапса';
		else word = 'синапсов';
		return price + ' ' + word;
	}
}
