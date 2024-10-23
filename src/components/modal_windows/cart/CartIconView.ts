import { EventEmitter } from '../../base/events';

export class CartIconView {
	private static instance: CartIconView;
	private counter: HTMLSpanElement;

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (CartIconView.instance) throw new Error();
		CartIconView.instance = new CartIconView(container, events);
	}

	static getInstance() {
		if (!CartIconView.instance) throw new Error();
		return CartIconView.instance;
	}

	private constructor(private container: HTMLElement, private events: EventEmitter) {
		this.container = container;
		this.counter = container.querySelector('.header__basket-counter');

		// Add click event listener to the cart icon button
		this.container.addEventListener('click', this.events.trigger('click'));
	}

	render(count: number): void {
		this.counter.textContent = count.toString();
	}
}
