import { EventEmitter } from '../../base/events';
import { DialogWindowView } from '../../PopupDialogWindowManager';

export enum PaymentMethod {
	Online,
	OnDelivery
}

export class AddressPaymentModal extends DialogWindowView {
	private static instance: AddressPaymentModal;
	private onlineBtn: HTMLButtonElement;
	private onDeliveryBtn: HTMLButtonElement;
	private addressInput: HTMLInputElement;
	private nextBtn: HTMLButtonElement;
	private selectedPaymentMethod: PaymentMethod | undefined = undefined;
	private address = '';

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (AddressPaymentModal.instance) throw new Error();
		AddressPaymentModal.instance = new AddressPaymentModal(container, events);
	}

	static getInstance() {
		if (!AddressPaymentModal.instance) throw new Error();
		return AddressPaymentModal.instance;
	}

	private constructor(container: HTMLElement, private events: EventEmitter) {
		super(container);
		this.addressInput = container.querySelector('.form__input');

		this.onlineBtn = container.querySelector('.order__buttons .button:first-child');
		this.onDeliveryBtn = container.querySelector('.order__buttons .button:last-child');
		this.nextBtn = container.querySelector('.modal__actions .button');

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		this.onlineBtn.addEventListener('click', () => this.selectPaymentMethod(PaymentMethod.Online));
		this.onDeliveryBtn.addEventListener('click', () => this.selectPaymentMethod(PaymentMethod.OnDelivery));
		this.addressInput.addEventListener('input', this.handleAddressInput.bind(this));
		this.nextBtn.addEventListener('click', () => {
			events.trigger('submit')({address: this.addressInput.value, payment: this.selectedPaymentMethod});
			events.trigger('next')();
		});

		this.container.querySelector("form").addEventListener('submit', e => e.preventDefault());

		this.updateNextButtonState();
	}

	private selectPaymentMethod(method: PaymentMethod) {
		this.selectedPaymentMethod = method;
		this.updatePaymentButtons();
		this.updateNextButtonState();
	}

	private handleAddressInput() {
		this.address = this.addressInput.value.trim();
		this.updateNextButtonState();
	}

	private updatePaymentButtons() {
		if (this.selectedPaymentMethod === PaymentMethod.Online) {
			this.onlineBtn.classList.add('button_alt-active');
			this.onDeliveryBtn.classList.remove('button_alt-active');
		} else if (this.selectedPaymentMethod === PaymentMethod.OnDelivery) {
			this.onDeliveryBtn.classList.add('button_alt-active');
			this.onlineBtn.classList.remove('button_alt-active');
		} else {
			this.onDeliveryBtn.classList.remove('button_alt-active');
			this.onlineBtn.classList.remove('button_alt-active');
		}
	}

	private updateNextButtonState() {
		const enabled = this.selectedPaymentMethod != undefined && this.address != '';
		this.nextBtn.disabled = !enabled;
	}

	render(): HTMLElement {
		this.addressInput.value = '';
		this.selectedPaymentMethod = null;
		this.updatePaymentButtons();
		this.updateNextButtonState();

		return this.container;
	}
}
