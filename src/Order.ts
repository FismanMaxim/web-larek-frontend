import { ProductItem } from './types/api-types';
import { PaymentMethod } from './components/modal_windows/addresspayment/AddressPaymentModal';

export class OrderBuilder {
	private _cartContent: ProductItem[];
	private _address: string;
	private _paymentMethod: PaymentMethod;
	private _email: string;
	private _phone: string;


	cartContent(value: ProductItem[]) {
		this._cartContent = value;
		return this;
	}

	address(value: string) {
		this._address = value;
		return this;
	}

	paymentMethod(value: PaymentMethod) {
		this._paymentMethod = value;
		return this;
	}

	email(value: string) {
		this._email = value;
		return this;
	}

	phone(value: string) {
		this._phone = value;
		return this;
	}

	build() {
		const price = this._cartContent.reduce((sum, item) => sum + item.price, 0);
		return new Order(this._cartContent, price, this._address, this._paymentMethod, this._email, this._phone);
	}
}

export class Order {
	constructor(
		private readonly cartContent: ProductItem[],
		private readonly totalPrice: number,
		private readonly address: string,
		private readonly paymentMethod: PaymentMethod,
		private readonly email: string,
		private readonly phone: string) {
	}
}