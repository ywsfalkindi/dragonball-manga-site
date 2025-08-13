// src/lib/types.ts

// ✨ السر رقم 4: إنشاء نوع عام احترافي يطابق استجابة PocketBase للقوائم
export interface PocketBaseListResult<T> {
	page: number;
	perPage: number;
	totalPages: number;
	totalItems: number;
	items: T[];
}

export interface Chapter {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	chapter_number: number;
	manga: string;
	// يمكن إضافة حقول أخرى مثل عنوان الفصل إن وجد
	// title?: string;
}

// ✨ نوع جديد لإثراء بيانات الفصل بمعلومات إضافية نحتاجها في الواجهة
export interface EnrichedChapter extends Chapter {
	isRead: boolean;
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
	status: 'مستمرة' | 'مكتملة' | 'متوقفة';
	cover_image: string;

	// هذا حقل نضيفه لاحقاً في الكود، لذلك نجعله اختيارياً
	cover_image_url?: string;

	// ✨ إثراء النوع بمعلومات إضافية مفيدة
	total_chapters?: number;
}

// ✨ نوع جديد يمثل بيانات سجل القراءة لتسهيل التعامل معه
export interface ReadHistoryRecord {
	id: string;
	user: string;
	manga: string;
	chapter: string; // هذا هو ID الفصل
	last_page_read: number;
	created: string;
	updated: string;
	expand: {
		manga: Manga; // نستخدم النوع المفصل للمانجا
		chapter: Chapter; // نستخدم النوع المفصل للفصل
	};
}

// نوع يمثل الفصل الأخير الذي تمت قراءته مع تفاصيله
export interface LastReadChapterInfo extends Chapter {
	last_page_read: number;
}

interface MangaRecord {
	id: string;
	slug: string;
	title: string;
	cover: string;
}

// تعريف شكل بيانات الفصل الأساسية
interface ChapterRecord {
	id: string;
	chapter_number: number;
}
