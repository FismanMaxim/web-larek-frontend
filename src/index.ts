import './scss/styles.scss';
import { Api } from './components/base/api';
import * as constants from './utils/constants';
import { GetProductItemsListResponse, ProductItem } from './types/api-types';
import { EventEmitter } from './components/base/events';

const api = new Api(constants.API_URL);

interface IView {
	render(data: object): HTMLElement;
}

class CatalogCardView implements IView {
	private categoryText: HTMLSpanElement;
	private titleText: HTMLHeadingElement;
	private image: HTMLImageElement;
	private priceText: HTMLSpanElement;
	private button: HTMLButtonElement;

	private displayedItem: ProductItem;

	constructor(private container: HTMLElement, onCardClicked: (item: ProductItem | undefined) => void) {
		this.categoryText = container.querySelector('.card__category');
		this.titleText = container.querySelector('.card__title');
		this.image = container.querySelector('.card__image');
		this.priceText = container.querySelector('.card__price');
		this.button = container.querySelector('button.gallery__item');

		this.button.addEventListener('click', () => {
			onCardClicked(this.displayedItem);
		});
	}

	render(data: { item: ProductItem }) {
		const item = data.item;
		this.categoryText.textContent = item.category;

		this.titleText.textContent = item.title;
		this.priceText.textContent = PricePrinter.print(item.price);
		this.image.src = item.image;
		this.displayedItem = item;
		return this.container;
	}
}

class TemplatesManager {
	private static templates: Map<string, HTMLTemplateElement>;

	static {
		this.templates = new Map<string, HTMLTemplateElement>();
		document.querySelectorAll('template').forEach(
			template => {
				this.templates.set(template.id, template);
			},
		);
	}

	static getTemplate(id: string): HTMLTemplateElement {
		return this.templates.get(id);
	}

	static newInstanceFromTemplate(templateId: string): HTMLElement {
		return this.templates.get(templateId).content.cloneNode(true) as HTMLElement;
	}
}


class CatalogCardsListView implements IView {
	private static readonly itemCardTemplateId = 'card-catalog';

	constructor(private container: HTMLElement, private onCardClicked: (item: ProductItem | undefined) => void) {
	}

	render(data: { items: ProductItem[] }): HTMLElement {
		data.items.forEach(item => {
				const newItemCardElement = TemplatesManager.newInstanceFromTemplate(CatalogCardsListView.itemCardTemplateId);
				const newItemCardView = new CatalogCardView(newItemCardElement, this.onCardClicked);

				this.container.appendChild(newItemCardView.render({ item: item }));
			},
		);

		return this.container;
	}
}

abstract class ModalWindowView implements IView {
	protected constructor(protected container: HTMLElement) {
	}

	public setVisibility(visible: boolean) {
		if (visible) {
			const scrollY = window.scrollY;
			this.container.classList.add('modal_active');
			this.container.style.top = `${scrollY}px`;
			document.body.style.overflow = 'hidden';
		} else {
			this.container.classList.remove('modal_active');
			document.body.style.overflow = 'auto';
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	render(data: object): HTMLElement {
		return this.container;
	}
}

class PricePrinter {
	static print(price: number) {
		if (price == 0 || price == null) return 'бесценно';

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

class ItemPreviewView extends ModalWindowView {
	private image: HTMLImageElement;
	private category: HTMLSpanElement;
	private title: HTMLParagraphElement;
	private description: HTMLParagraphElement;
	private price: HTMLSpanElement;
	private inCartButton: HTMLButtonElement;
	private displayedItem: ProductItem;
	private static instance: ItemPreviewView;

	static newInstance(container: HTMLElement, events: EventEmitter) {
		if (this.instance) throw new Error();
		this.instance = new ItemPreviewView(container, events);
	}

	static getInstance() {
		return this.instance;
	}

	private constructor(container: HTMLElement, events: EventEmitter) {
		super(container);

		this.image = container.querySelector('.card__image');
		this.category = container.querySelector('.card__category');
		this.title = container.querySelector('.card__title');
		this.description = container.querySelector('.card__text');
		this.price = container.querySelector('.card__price');
		this.inCartButton = this.container.querySelector('.card__row button');

		this.inCartButton.addEventListener('click', () => {
			// const func = events.trigger('in-cart');
			// func(this.displayedItem);
			events.trigger('in-cart')(this.displayedItem);
		});

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
	}

	private disableInCartButton() {
		this.inCartButton.disabled = true;
		this.inCartButton.textContent = 'Уже в корзине';
	}

	private enableInCartButton() {
		this.inCartButton.disabled = false;
		this.inCartButton.textContent = 'В корзину';
	}

	render(item: ProductItem): HTMLElement {
		if (cartContent.some(i => i.id == item.id)) {
			this.disableInCartButton();
		} else {
			this.enableInCartButton();
		}

		this.image.src = item.image;
		this.category.textContent = item.category;
		this.title.textContent = item.title;
		this.description.textContent = item.description;
		this.price.textContent = PricePrinter.print(item.price);

		this.displayedItem = item;

		return this.container;
	}
}

class PopupDialogWindowManager {
	private static instance: PopupDialogWindowManager;
	private currentWindow: ModalWindowView;

	static getInstance() {
		if (this.instance == undefined) {
			this.instance = new PopupDialogWindowManager();
		}
		return this.instance;
	}

	showWindow(window: ModalWindowView, data?: object) {
		if (this.currentWindow != null)
			this.closeCurrentWindow();

		this.currentWindow = window;

		this.renderDialogWindow(window, data);
	}

	closeCurrentWindow() {
		this.currentWindow.setVisibility(false);
		this.currentWindow = null;
	}

	private renderDialogWindow(window: ModalWindowView, data: object) {
		window.setVisibility(true);
		window.render(data);
	}
}

class CartElementView implements IView {
	private index: HTMLSpanElement;
	private title: HTMLSpanElement;
	private price: HTMLSpanElement;
	private displayedItem: ProductItem;

	constructor(private container: HTMLElement, private elementsHolder: CartElementsHolder) {
		this.index = container.querySelector('.basket__item-index');
		this.title = container.querySelector('.card__title');
		this.price = container.querySelector('.card__price');

		container.querySelector('.basket__item-delete').addEventListener('click', this.removeSelfFromCart.bind(this));
	}

	private removeSelfFromCart() {
		this.elementsHolder.removeElement(this);
	}

	getItem() {
		return this.displayedItem;
	}

	render(data: { item: ProductItem, index: number }): HTMLElement {
		this.displayedItem = data.item;

		this.index.textContent = (data.index + 1).toString();
		this.title.textContent = data.item.title;
		this.price.textContent = PricePrinter.print(data.item.price);

		return this.container;
	}
}

class CartElementsHolder implements IView {
	constructor(private container: HTMLElement, private cart: CartModal) {
		container.innerHTML = '';
	}

	removeElement(element: CartElementView) {
		this.cart.handleItemRemoved(element.getItem());
	}

	render(items: ProductItem[]): HTMLElement {
		this.container.innerHTML = '';

		items.forEach((item, index) => {
			const cartElementContainer = TemplatesManager.newInstanceFromTemplate('card-basket');
			const cartElement: CartElementView = new CartElementView(cartElementContainer, this);
			this.container.appendChild(cartElement.render({ item: item, index: index }));
		});

		return this.container;
	}
}


class CartModal extends ModalWindowView {
	private elementsHolder: CartElementsHolder;
	private fullPrice: HTMLSpanElement;
	private items: ProductItem[];
	private submitButton: HTMLButtonElement;
	private static instance: CartModal;

	static createInstance(container: HTMLElement, events: EventEmitter): CartModal {
		if (this.instance) throw new Error();
		this.instance = new CartModal(container, events);
		return this.instance;
	}

	static getInstance(): CartModal {
		return this.instance;
	}

	private constructor(container: HTMLElement, events: EventEmitter) {
		super(container);

		this.elementsHolder = new CartElementsHolder(container.querySelector('.basket__list'), this);
		this.fullPrice = container.querySelector('.basket__price');
		this.submitButton = this.container.querySelector('.modal__actions button.button');

		this.container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		this.submitButton.addEventListener('click', events.trigger('create-order'));
	}

	handleItemRemoved(item: ProductItem) {
		this.items = this.items.filter(i => {
			return i !== item;
		});
		removeItemFromCart(item);
		this.render(this.items);
	}

	render(items: ProductItem[]): HTMLElement {
		this.elementsHolder.render(items);
		this.items = items;

		if (items.length > 0) {
			const fullPrice = items.reduce((sum, item) => sum + item.price, 0);
			this.fullPrice.textContent = PricePrinter.print(fullPrice);
			this.submitButton.disabled = false;
		} else {
			this.fullPrice.textContent = '';
			this.submitButton.disabled = true;
		}

		return this.container;
	}
}

enum PaymentMethod {
	ONLINE,
	ON_DELIVERY
}

class PaymentModal extends ModalWindowView {
	private nextButton: HTMLButtonElement;
	private paymentMethod: PaymentMethod | undefined;
	private address: HTMLInputElement;
	private readonly onlineButton: HTMLButtonElement;
	private readonly onDeliveryButton: HTMLButtonElement;
	private static instance: PaymentModal;

	static createInstance(container: HTMLElement, events: EventEmitter): PaymentModal {
		if (this.instance) throw new Error();
		this.instance = new PaymentModal(container, events);
		return this.instance;
	}

	static getInstance(): PaymentModal {
		return this.instance;
	}

	private constructor(container: HTMLElement, events: EventEmitter) {
		super(container);

		this.nextButton = container.querySelector('.modal__actions .button');
		this.address = container.querySelector('.form__input#delivery-address');
		this.onlineButton = container.querySelector('.order__buttons #order-online');
		this.onDeliveryButton = container.querySelector('.order__buttons #order-on-delivery');

		this.address.addEventListener('input', this.updateNextButtonEnable.bind(this));

		this.nextButton.addEventListener('click', () => {
			events.trigger('next')({
				paymentMethod: this.paymentMethod,
				address: this.address.value,
			});
		});

		this.onlineButton.addEventListener('click', () => {
			this.selectPaymentMethod(PaymentMethod.ONLINE);
		});
		this.onDeliveryButton.addEventListener('click', () => {
			this.selectPaymentMethod(PaymentMethod.ON_DELIVERY);
		});

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));

		container.querySelector('.form').addEventListener('submit', event => {
			event.preventDefault();
		});
	}


	private selectPaymentMethod(method: PaymentMethod) {
		this.paymentMethod = method;

		this.setButtonActive(this.onlineButton, method == PaymentMethod.ONLINE);
		this.setButtonActive(this.onDeliveryButton, method == PaymentMethod.ON_DELIVERY);

		this.updateNextButtonEnable();
	}

	private setButtonActive(button: HTMLButtonElement, active: boolean) {
		if (active) {
			button.classList.add('button_alt-active');
		} else {
			button.classList.remove('button_alt-active');
		}
	}

	private updateNextButtonEnable() {
		const enabled = this.paymentMethod != undefined && this.address.value != '';
		this.nextButton.disabled = !enabled;
	}
}

class ContactModal extends ModalWindowView {
	private readonly email: HTMLInputElement;
	private readonly phone: HTMLInputElement;
	private submit: HTMLButtonElement;
	private static instance: ContactModal;

	static newInstance(container: HTMLElement, events: EventEmitter): ContactModal {
		if (this.instance) throw new Error();
		this.instance = new ContactModal(container, events);
		return this.instance;
	}

	static getInstance(): ContactModal {
		return this.instance;
	}

	constructor(container: HTMLElement, events: EventEmitter) {
		super(container);

		this.email = container.querySelector('#order-email');
		this.phone = container.querySelector('#order-phone');
		this.submit = container.querySelector('.modal__actions .button');

		this.submit.addEventListener('click', () => {
			events.trigger('submit')({ email: this.email.value, phone: this.phone.value });
		});
		this.email.addEventListener('input', this.updateSubmitEnable.bind(this));
		this.phone.addEventListener('input', this.updateSubmitEnable.bind(this));

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		container.querySelector('.form').addEventListener('submit', event => event.preventDefault());
	}

	private updateSubmitEnable() {
		const enabled = this.email.value != '' && this.phone.value != '';
		this.submit.disabled = !enabled;
	}
}

class OrderCompletedModal extends ModalWindowView {
	private static instance: OrderCompletedModal;
	private fullPriceText: HTMLParagraphElement;

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (this.instance) throw new Error();
		this.instance = new OrderCompletedModal(container, events);
	}

	static getInstance() {
		return this.instance;
	}

	private constructor(container: HTMLElement, events: EventEmitter) {
		super(container);

		this.fullPriceText = container.querySelector('.order-success .film__description');

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		container.querySelector('.order-success__close').addEventListener('click', events.trigger('close'));
	}

	render(data: { fullPrice: number }): HTMLElement {
		this.fullPriceText.textContent = 'Списано ' + PricePrinter.print(data.fullPrice);

		return this.container;
	}
}


const modalManager = PopupDialogWindowManager.getInstance();

let cartContent: ProductItem[] = [];

const cartButton = document.querySelector('.header__basket');
const cartSizeText = cartButton.querySelector('.header__basket-counter');

class OrderInfo {
	public readonly cartContent: ProductItem[];
	public readonly paymentMethod: PaymentMethod;
	public readonly address: string;
	public readonly email: string;
	public readonly phone: string;
	public readonly fullPrice: number;

	static OrderInfoBuilder = class {
		private cartContent: ProductItem[];
		private paymentMethod: PaymentMethod;
		private address: string;
		private email: string;
		private phone: string;

		setCartContent(cartContent: ProductItem[]) {
			this.cartContent = cartContent;
			return this;
		}

		setPaymentMethod(paymentMethod: PaymentMethod) {
			this.paymentMethod = paymentMethod;
			return this;
		}

		setAddress(address: string) {
			this.address = address;
			return this;
		}

		setEmail(email: string) {
			this.email = email;
			return this;
		}

		setPhone(phone: string) {
			this.phone = phone;
			return this;
		}

		build() {
			return new OrderInfo(this.cartContent, this.paymentMethod, this.address, this.email, this.phone);
		}
	};

	private constructor(cartContent: ProductItem[], paymentMethod: PaymentMethod, address: string, email: string, phone: string) {
		this.cartContent = cartContent;
		this.paymentMethod = paymentMethod;
		this.address = address;
		this.email = email;
		this.phone = phone;
		this.fullPrice = cartContent.reduce((sum, item) => sum + item.price, 0);
	}
}

let orderBuilder = new OrderInfo.OrderInfoBuilder();
function addItemToCart(item: ProductItem) {
	cartContent.push(item);
	cartSizeText.textContent = cartContent.length.toString();
}

function removeItemFromCart(item: ProductItem) {
	cartContent = cartContent.filter(i => i !== item);
	cartSizeText.textContent = cartContent.length.toString();
}

function acceptContactData(email: string, phone: string) {
	orderBuilder.setEmail(email).setPhone(phone);
}

function acceptPaymentData(paymentMethod: PaymentMethod, address: string) {
	orderBuilder.setPaymentMethod(paymentMethod).setAddress(address);
}

function sendOrder() {
	orderBuilder.setCartContent(cartContent);
	const order = orderBuilder.build();
	console.log("New order created: ", order);
}

function finishOrder() {
	orderBuilder = new OrderInfo.OrderInfoBuilder();
	cartContent = [];
	cartSizeText.textContent = cartContent.length.toString();
}

function closeCurrentWindow() {
	modalManager.closeCurrentWindow();
}

// Initialize modal windows
PaymentModal.createInstance(document.getElementById('payment-modal'), new EventEmitter(new Map([
	['next', (data: { paymentMethod: PaymentMethod, address: string }) => {
		acceptPaymentData(data.paymentMethod, data.address);
		modalManager.showWindow(ContactModal.getInstance());
	}],
	['close', closeCurrentWindow]])));
CartModal.createInstance(document.getElementById('cart-modal'), new EventEmitter(new Map([
	['create-order', () => modalManager.showWindow(PaymentModal.getInstance())],
	['close', closeCurrentWindow]])));
ContactModal.newInstance(document.getElementById('contact-data-modal'), new EventEmitter(new Map([
	['submit', (data: { email: string, phone: string }) => {
		acceptContactData(data.email, data.phone);
		const fullPrice = cartContent.reduce((sum, item) => sum + item.price, 0);

		sendOrder();

		modalManager.showWindow(OrderCompletedModal.getInstance(), { fullPrice: fullPrice });
	}],
	['close', closeCurrentWindow]])));
OrderCompletedModal.createInstance(document.getElementById('order-completed-modal'), new EventEmitter(new Map([
	['close', () => {
		finishOrder();
		closeCurrentWindow();
	}]])));
ItemPreviewView.newInstance(document.querySelector('#card-preview-modal'), new EventEmitter(new Map([
	['in-cart', (item: ProductItem) => {
		addItemToCart(item);
		closeCurrentWindow();
	}],
	['close', closeCurrentWindow]])));


// Fetch all products
const galleryContainer = document.querySelector('.page__wrapper > .gallery') as HTMLElement;
const catalogCardsListView = new CatalogCardsListView(galleryContainer, (item) => modalManager.showWindow(ItemPreviewView.getInstance(), item));

cartButton.addEventListener('click', () => modalManager.showWindow(CartModal.getInstance(), cartContent));

api.get('/product')
	.then(response => {
		const itemsListResponse = response as GetProductItemsListResponse;
		const products = itemsListResponse.items;
		const filledGallery = catalogCardsListView.render({ items: products });
		galleryContainer.replaceWith(filledGallery);
	});




