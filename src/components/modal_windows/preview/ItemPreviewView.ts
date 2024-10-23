import { EventEmitter } from '../../base/events';
import { ProductItem } from '../../../types/api-types';
import { DialogWindowView } from '../../PopupDialogWindowManager';
import { PricePrinter } from '../../../utils/PricePrinter';

export class ItemPreviewView extends DialogWindowView {
	private static instance: ItemPreviewView;
	private image: HTMLImageElement;
	private category: HTMLSpanElement;
	private title: HTMLParagraphElement;
	private description: HTMLParagraphElement;
	private price: HTMLSpanElement;
	private displayedItem: ProductItem;
	private inCartButton: HTMLButtonElement;

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (ItemPreviewView.instance) throw new Error();
		ItemPreviewView.instance = new ItemPreviewView(container, events);
	}

	static getInstance() {
		if (!ItemPreviewView.instance) throw new Error();
		return ItemPreviewView.instance;
	}

	private constructor(container: HTMLElement, events: EventEmitter) {
		super(container);
		this.image = container.querySelector('.card__image');
		this.category = container.querySelector('.card__category');
		this.title = container.querySelector('.card__title');
		this.description = container.querySelector('.card__text');
		this.price = container.querySelector('.card__price');
		this.inCartButton = container.querySelector('.card__row button');

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close').bind(this));
		this.inCartButton.addEventListener('click', () => {
			events.trigger('in-cart')(this.displayedItem);
		});
	}

	render(data: { item: ProductItem, isInCart: boolean }): HTMLElement {
		this.displayedItem = data.item;
		this.image.src = data.item.image;
		this.category.textContent = data.item.category;
		this.title.textContent = data.item.title;
		this.description.textContent = data.item.description;
		this.price.textContent = PricePrinter.print(data.item.price);

		if (data.isInCart) {
			this.inCartButton.textContent = 'Уже в корзине';
			this.inCartButton.disabled = true;
		} else {
			this.inCartButton.textContent = 'В корзину';
			this.inCartButton.disabled = false;
		}

		return this.container;
	}
}
