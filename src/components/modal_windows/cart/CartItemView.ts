import { PricePrinter } from '../../../utils/PricePrinter';
import { TemplatesManager } from '../../../utils/TemplatesManager';
import { ProductItem } from '../../../types/api-types';
import { CartView } from './CartView';

export class CartItemView {
	private readonly container: HTMLElement;
	private itemIndex: HTMLSpanElement;
	private title: HTMLSpanElement;
	private price: HTMLSpanElement;

	constructor(private cart: CartView, private item: ProductItem, private index: number) {
		this.container = TemplatesManager.fromTemplate('card-basket') as HTMLElement;
		this.itemIndex = this.container.querySelector('.basket__item-index');
		this.title = this.container.querySelector('.card__title');
		this.price = this.container.querySelector('.card__price');

		this.container.querySelector('.basket__item-delete').addEventListener('click', this.deleteSelf.bind(this));
	}

	private deleteSelf() {
		this.cart.deleteItem(this.item);
	}

	render(): HTMLElement {
		// Set the item details
		this.itemIndex.textContent = this.index.toString();
		this.title.textContent = this.item.title;
		this.price.textContent = PricePrinter.print(this.item.price);

		return this.container;
	}
}
