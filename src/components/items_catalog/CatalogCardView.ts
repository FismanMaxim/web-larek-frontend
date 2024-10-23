import { ProductItem } from '../../types/api-types';
import { IView } from '../IView';
import { EventEmitter } from '../base/events';

export class CatalogCardView implements IView {
	private categoryText: HTMLSpanElement;
	private titleText: HTMLHeadingElement;
	private image: HTMLImageElement;
	private priceText: HTMLSpanElement;
	private button: HTMLButtonElement;

	private displayedItem: ProductItem;

	constructor(private container: HTMLElement, events: EventEmitter) {
		this.categoryText = container.querySelector('.card__category');
		this.titleText = container.querySelector('.card__title');
		this.image = container.querySelector('.card__image');
		this.priceText = container.querySelector('.card__price');
		this.button = container.querySelector('button.gallery__item');

		this.button.addEventListener('click', () => {
			events.trigger('clicked')(this.displayedItem);
		});
	}

	render(data: { item: ProductItem }) {
		const item = data.item;
		this.displayedItem = item;
		this.categoryText.textContent = item.category;
		this.titleText.textContent = item.title;
		this.priceText.textContent = String(item.price) + ' синапсов';
		this.image.src = item.image;
		return this.container;
	}
}
