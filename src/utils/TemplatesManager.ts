export class TemplatesManager {
	private static templates: Map<string, HTMLTemplateElement>;

	static {
		this.templates = new Map<string, HTMLTemplateElement>();
		console.log(document);
		console.log(document.querySelectorAll('template'));
		document.querySelectorAll('template').forEach(
			template => {
				this.templates.set(template.id, template);
			},
		);
	}

	static getTemplate(id: string): HTMLTemplateElement {
		return this.templates.get(id);
	}

	static fromTemplate(id: string): HTMLElement {
		return this.templates.get(id).content.cloneNode(true) as HTMLElement;
	}
}
