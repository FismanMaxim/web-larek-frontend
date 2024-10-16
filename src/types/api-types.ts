class ProductItem {
	public readonly id: string;
	public readonly description: string;
	public readonly image: string;
	public readonly title: string;
	public readonly category: string;
	public readonly price: number;

	constructor(id: string, description: string, imageUrl: string, title: string, category: string, price: number) {
		this.id = id;
		this.description = description;
		this.image = imageUrl;
		this.title = title;
		this.category = category;
		this.price = price;
	}
}

class GetProductItemsListResponse {
	public readonly total: number;
	public readonly items: ProductItem[];
}

class PostOrderRequest {
	public readonly payment: string;
	public readonly email: string;
	public readonly phone: string;
	public readonly address: string;
	public readonly total: number;
	public readonly itemsIdsList: string[];

	constructor(payment: string, email: string, phone: string, address: string, total: number, itemsIdsList: string[]) {
		this.payment = payment;
		this.email = email;
		this.phone = phone;
		this.address = address;
		this.total = total;
		this.itemsIdsList = itemsIdsList;
	}
}

class PostOrderResponse {
	public readonly orderId: string;
	public readonly total: number;

	constructor(orderId: string, total: number) {
		this.orderId = orderId;
		this.total = total;
	}
}

class ErrorResponse {
	public readonly error: string;

	constructor(error: string) {
		this.error = error;
	}
}

export {
	ProductItem,
	GetProductItemsListResponse,
	PostOrderResponse,
	PostOrderRequest,
	ErrorResponse,
};