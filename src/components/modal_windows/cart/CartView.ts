import { PricePrinter } from '../../../utils/PricePrinter';
import { ProductItem } from '../../../types/api-types';
import { EventEmitter } from '../../base/events';
import { DialogWindowView } from '../../PopupDialogWindowManager';
import { CartItemView } from './CartItemView';

export class CartView extends DialogWindowView {
	private static instance: CartView;
	private cartList: HTMLElement;
	private totalPrice: HTMLSpanElement;
	private displayedItems: ProductItem[] = [];

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (CartView.instance) throw new Error();
		CartView.instance = new CartView(container, events);
	}

	static getInstance() {
		if (!CartView.instance) throw new Error();
		return CartView.instance;
	}

	private constructor(container: HTMLElement, private events: EventEmitter) {
		super(container);
		this.cartList = container.querySelector('.basket__list');
		this.totalPrice = container.querySelector('.basket__price');

		container.querySelector('.modal__close').addEventListener('click', this.events.trigger('close'));
		container.querySelector('.modal__actions .button').addEventListener('click', () => {
			this.events.trigger('checkout')(this.displayedItems);
		});
	}

	render(items: ProductItem[]): HTMLElement {
		this.displayedItems = items;

		this.cartList.innerHTML = '';

		items.forEach((item, index) => {
			const cartItemView = new CartItemView(this, item, index + 1);
			this.cartList.appendChild(cartItemView.render());
		});

		const totalPriceValue = items.reduce((total, item) => total + item.price, 0);
		this.totalPrice.textContent = PricePrinter.print(totalPriceValue);

		return this.container;
	}

	deleteItem(item: ProductItem) {
		this.render(this.displayedItems.filter(i => i !== item));
		this.events.trigger('remove-item')(item);
	}
}
