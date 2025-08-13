export interface Chapter {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	chapter_number: number;
	manga: string;
	// أضف أي حقول أخرى لديك في جدول الفصول
}

export interface Manga {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	title: string;
	slug: string;
	description: string;
	author: string;
	status: 'مستمرة' | 'مكتملة' | 'متوقفة'; // يمكن تحديد الحالات الممكنة
	cover_image: string;

	// هذا حقل نضيفه لاحقاً في الكود، لذلك نجعله اختيارياً
	cover_image_url?: string;

	// هذا حقل يأتي من خلال expand في Pocketbase
	expand?: {
		'chapters(manga)'?: Chapter[];
	};
}
