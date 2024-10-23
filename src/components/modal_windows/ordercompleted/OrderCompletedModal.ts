import { EventEmitter } from '../../base/events';
import { DialogWindowView } from '../../PopupDialogWindowManager';
import { PricePrinter } from '../../../utils/PricePrinter';

export class OrderCompletedModal extends DialogWindowView {
	private static instance: OrderCompletedModal;
	private description: HTMLParagraphElement;

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (OrderCompletedModal.instance) throw new Error();
		OrderCompletedModal.instance = new OrderCompletedModal(container, events);
	}

	static getInstance() {
		if (!OrderCompletedModal.instance) throw new Error();
		return OrderCompletedModal.instance;
	}

	private constructor(container: HTMLElement, private events: EventEmitter) {
		super(container);
		this.description = this.container.querySelector('.film__description');

		this.container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		this.container.querySelector('.order-success__close').addEventListener('click', events.trigger('close'));
	}

	render(data: { fullPrice: number }): HTMLElement {
		this.description.textContent = `Списано ${PricePrinter.print(data.fullPrice)}`;
		return this.container;
	}
}
