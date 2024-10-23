import { EventEmitter } from '../../base/events';
import { DialogWindowView } from '../../PopupDialogWindowManager';

export class ContactsModal extends DialogWindowView {
	private static instance: ContactsModal;
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private nextBtn: HTMLButtonElement;
	private email = '';
	private phone = '';

	static createInstance(container: HTMLElement, events: EventEmitter) {
		if (ContactsModal.instance) throw new Error();
		ContactsModal.instance = new ContactsModal(container, events);
	}

	static getInstance() {
		if (!ContactsModal.instance) throw new Error();
		return ContactsModal.instance;
	}

	private constructor(container: HTMLElement, private events: EventEmitter) {
		super(container);
		this.emailInput = container.querySelector('.order__field:first-child .form__input');
		this.phoneInput = container.querySelector('.order__field:last-child .form__input');
		this.nextBtn = container.querySelector('.modal__actions .button');

		container.querySelector('.modal__close').addEventListener('click', events.trigger('close'));
		this.emailInput.addEventListener('input', this.handleEmailInput.bind(this));
		this.phoneInput.addEventListener('input', this.handlePhoneInput.bind(this));
		this.nextBtn.addEventListener('click', () => {
			events.trigger('submit')({
				email: this.emailInput.value,
				phone: this.phoneInput.value,
			});
			events.trigger('next')();
		});

		this.container.querySelector("form").addEventListener('submit', e => e.preventDefault());

		this.updateNextButtonState();
	}

	private handleEmailInput() {
		this.email = this.emailInput.value.trim();
		this.updateNextButtonState();
	}

	private handlePhoneInput() {
		this.phone = this.phoneInput.value.trim();
		this.updateNextButtonState();
	}

	private updateNextButtonState() {
		const enabled = this.email != '' && this.phone != '';
		this.nextBtn.disabled = !enabled;
	}

	render(): HTMLElement {
		this.emailInput.value = '';
		this.phoneInput.value = '';
		this.updateNextButtonState();

		return this.container;
	}
}
