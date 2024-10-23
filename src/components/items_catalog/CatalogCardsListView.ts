import { ProductItem } from '../../types/api-types';
import { IView } from '../IView';
import { CatalogCardView } from './CatalogCardView';
import { TemplatesManager } from '../../utils/TemplatesManager';
import { EventEmitter } from '../base/events';

export class CatalogCardsListView implements IView {
	private static readonly itemCardTemplateId = 'card-catalog';

	constructor(private container: HTMLElement, private events: EventEmitter) {
	}

	render(data: { items: ProductItem[] }): HTMLElement {
		data.items.forEach(item => {
				const newItemCardElement = TemplatesManager.fromTemplate(CatalogCardsListView.itemCardTemplateId);
				const newItemCardView = new CatalogCardView(newItemCardElement, this.events);

				this.container.appendChild(newItemCardView.render({ item: item }));
			},
		);

		return this.container;
	}
}
