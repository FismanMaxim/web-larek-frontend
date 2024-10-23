import './scss/styles.scss';
import { Api } from './components/base/api';
import * as constants from './utils/constants';
import { GetProductItemsListResponse, ProductItem } from './types/api-types';
import { EventEmitter } from './components/base/events';
import { PopupDialogWindowManager } from './components/PopupDialogWindowManager';
import { ItemPreviewView } from './components/modal_windows/preview/ItemPreviewView';
import { CatalogCardsListView } from './components/items_catalog/CatalogCardsListView';
import { CartView } from './components/modal_windows/cart/CartView';
import { CartIconView } from './components/modal_windows/cart/CartIconView';
import { AddressPaymentModal, PaymentMethod } from './components/modal_windows/addresspayment/AddressPaymentModal';
import { OrderBuilder } from './Order';
import { ContactsModal } from './components/modal_windows/contacts/ContactsModal';
import { OrderCompletedModal } from './components/modal_windows/ordercompleted/OrderCompletedModal';

const api = new Api(constants.API_URL);
api.get('/product')
	.then(response => {
		const itemsListResponse = response as GetProductItemsListResponse;
		const products = itemsListResponse.items;
		const filledGallery = catalogCardsListView.render({ items: products });
		galleryContainer.replaceWith(filledGallery);
	});

// Cached singleton modal manager
const modalManager = PopupDialogWindowManager.getInstance();

// Current state of cart
let cartContent: ProductItem[] = [];
// Current state of order
let orderBuilder = new OrderBuilder();

//region Логика последовательности модальных окон
function updateCartSize() {
	CartIconView.getInstance().render(cartContent.length);
}

function addItemToCart(item: ProductItem) {
	cartContent.push(item);
	updateCartSize();
}

function closeCurrentWindow() {
	PopupDialogWindowManager.getInstance().closeCurrentWindow();
}

function removeItem(item: ProductItem) {
	cartContent = cartContent.filter(el => el.id !== item.id);
	updateCartSize();
}

function completeOrder() {
	const order = orderBuilder.build();
	console.log(order);
	orderBuilder = new OrderBuilder();
}

// Create singleton windows
const cardPreviewModalContainer = document.querySelector('#card-preview-modal') as HTMLElement;
ItemPreviewView.createInstance(cardPreviewModalContainer, new EventEmitter(
	[
		'in-cart', (item: ProductItem) => {
		addItemToCart(item);
		closeCurrentWindow();
	}],
	[
		'close',
		closeCurrentWindow,
	]));

const cartView = document.querySelector('#cart-modal') as HTMLElement;
CartView.createInstance(cartView, new EventEmitter(
	['remove-item', (item: ProductItem) => removeItem(item)],
	['checkout', () => modalManager.showWindow(AddressPaymentModal.getInstance())],
	['close', closeCurrentWindow],
));

const cartIcon = document.querySelector('.header__basket') as HTMLElement;
CartIconView.createInstance(cartIcon, new EventEmitter(
	['click', () => modalManager.showWindow(CartView.getInstance(), cartContent)],
));

const addressPaymentView = document.querySelector('#address-payment-modal') as HTMLElement;
AddressPaymentModal.createInstance(addressPaymentView, new EventEmitter(
	['submit', (data: {
		address: string,
		payment: PaymentMethod
	}) => orderBuilder.address(data.address).paymentMethod(data.payment)],
	['next', () => modalManager.showWindow(ContactsModal.getInstance())],
	['close', closeCurrentWindow],
));

const contactsView = document.querySelector('#email-phone-modal') as HTMLElement;
ContactsModal.createInstance(contactsView, new EventEmitter(
	['submit', (data: {
		email: string,
		phone: string
	}) => orderBuilder.email(data.email).phone(data.phone)],
	['next', () => {
		completeOrder();
		const fullPrice = cartContent.reduce((sum, item) => sum + item.price, 0);
		modalManager.showWindow(OrderCompletedModal.getInstance(), { fullPrice: fullPrice });
	}],
	['close', closeCurrentWindow],
));

const orderCompletedView = document.querySelector('#order-completed-modal') as HTMLElement;
OrderCompletedModal.createInstance(orderCompletedView, new EventEmitter(
	['close', closeCurrentWindow],
));
// endregion

// Fetch all products
const galleryContainer = document.querySelector('.page__wrapper > .gallery') as HTMLElement;
const catalogCardsListView = new CatalogCardsListView(galleryContainer, new EventEmitter(
	['clicked', (item: ProductItem) => {
		const modalWindow = ItemPreviewView.getInstance();
		const isInCart = cartContent.some(el => el.id == item.id);
		modalManager.showWindow(modalWindow, { item, isInCart });
	}],
));




