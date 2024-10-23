import { IView } from './IView';

export abstract class DialogWindowView implements IView {
	protected constructor(protected container: HTMLElement) {
	}

	abstract render(data: object): HTMLElement;

	setVisibility(visible: boolean) {
		if (visible)
			this.container.classList.add('modal_active');
		else
			this.container.classList.remove('modal_active');
	}
}

export class PopupDialogWindowManager {
	private static instance: PopupDialogWindowManager;
	private currentWindow: DialogWindowView;

	static getInstance() {
		if (this.instance == undefined) {
			this.instance = new PopupDialogWindowManager();
		}
		return this.instance;
	}

	showWindow(window: DialogWindowView, data?: object) {
		if (this.currentWindow != null)
			this.closeCurrentWindow();

		this.currentWindow = window;
		this.renderDialogWindow(window, data);
	}

	closeCurrentWindow() {
		this.currentWindow.setVisibility(false);
		this.currentWindow = null;
	}

	private renderDialogWindow(window: DialogWindowView, data: object) {
		window.setVisibility(true);
		window.render(data);
	}
}
