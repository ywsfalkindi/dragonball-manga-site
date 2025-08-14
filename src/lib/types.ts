// src/lib/types.ts

import type { RecordModel } from 'pocketbase';

// ===============================================================
// ✨ الأنواع الأساسية والإضافات الجديدة ✨
// ===============================================================

/**
 * يمثل النوع الأساسي لأي سجل قادم من PocketBase، لتقليل التكرار.
 */
export interface BaseRecord {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
}

/**
 * يمثل النوع الكامل للمستخدم المسجل دخوله في التطبيق.
 */
export interface User extends BaseRecord {
    username: string;
    email: string;
    name: string;
    avatar: string;
}

/**
 * نوع عام يطابق استجابة PocketBase للقوائم التي تدعم الترقيم (Pagination).
 * تم توحيد الاسم إلى PaginatedResult ليتوافق مع الاستخدام في ملفات server.
 */
export interface PaginatedResult<T> {
	page: number;
	perPage: number;
	totalPages: number;
	totalItems: number;
	items: T[];
}


// ===============================================================
// ✨ الأنواع الأصلية من ملفك (بدون حذف) ✨
// ===============================================================

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

/**
 * نوع جديد لإثراء بيانات الفصل بمعلومات إضافية نحتاجها في الواجهة.
 */
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

	// إثراء النوع بمعلومات إضافية مفيدة
	total_chapters?: number;
}

/**
 * نوع جديد يمثل بيانات سجل القراءة لتسهيل التعامل معه.
 */
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

/**
 * نوع يمثل الفصل الأخير الذي تمت قراءته مع تفاصيله.
 */
export interface LastReadChapterInfo extends Chapter {
	last_page_read: number;
}

interface MangaRecord {
	id: string;
	slug: string;
	title: string;
	cover: string;
}

/**
 * تعريف شكل بيانات الفصل الأساسية.
 */
interface ChapterRecord {
	id: string;
	chapter_number: number;
}

/**
 * نوع يمثل بيانات المستخدم الأساسية التي نعرضها مع التعليق.
 */
export interface CommentUser {
	id: string;
	username: string;
	name: string;
	avatarUrl: string | null;
}

/**
 * بطاقة التعريف الرسمية للتعليق في تطبيقنا.
 */
export interface CommentType {
	id: string;
	content: string;
	created: string;
	parentComment: string | null;
	likes: string[]; // قائمة بمعرفات المستخدمين الذين أعجبوا بالتعليق
	user: CommentUser | null; // بيانات ناشر التعليق
	replies: CommentType[]; // قائمة الردود، وهي أيضاً من نوع CommentType
}