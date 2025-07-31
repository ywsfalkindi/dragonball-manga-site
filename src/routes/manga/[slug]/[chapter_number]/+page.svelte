<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { pageDisplayMode, readingMode, readerBackgroundColor, imageFitMode } from '$lib/stores/settings';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';

	export let data: PageData;
	// svelte-ignore export_let_unused
		export let form: ActionData;
	const { user, manga, chapter, pages, comments } = data;
	const currentChapter = Number(chapter.chapter_number);
	let currentPageIndex = 0;
	$: progress = pages.length > 0 ? ((currentPageIndex + 1) / pages.length) * 100 : 0;
	let imagesToPreload: string[] = [];
	const PRELOAD_AHEAD_COUNT = 3;

	let showSettings = false;
	let showThumbnails = false;
	let uiVisible = true;
	let inactivityTimer: number;

	function hideUI() {
		if (showSettings || showThumbnails) return;
		uiVisible = false;
	}

	function resetTimer() {
		uiVisible = true;
		// ✨ -- التغيير هنا -- ✨
		window.clearTimeout(inactivityTimer);
		inactivityTimer = window.setTimeout(hideUI, 3000);
	}

	let lastScrollY = 0;
	function handleScroll() {
		if (window.scrollY < lastScrollY) {
			resetTimer();
		}
		lastScrollY = window.scrollY;
	}

	// --- التحسين: منطق Intersection Observer ---
	let imageElements: HTMLImageElement[] = [];
	let observer: IntersectionObserver;
	onMount(() => {
		resetTimer();
		const updateFullscreenStatus = () => {
			isFullscreen = document.fullscreenElement !== null;
		};
		document.addEventListener('fullscreenchange', updateFullscreenStatus);

		// إعداد الـ Observer
		if ($readingMode === 'vertical' && imageElements.length > 1) {
			const options = {
				root: null, // يراقب بالنسبة لنافذة العرض
				rootMargin: '500px 0px', // ابدأ التحميل عندما تكون الصورة على بعد 500 بكسل
				threshold: 0.01
			};

			observer = new IntersectionObserver((entries, obs) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target as HTMLImageElement;
						const src = img.dataset.src;
						if (src) {
							img.src = src;
						}
						obs.unobserve(img); // توقف عن مراقبة الصورة بعد تحميلها
					}
				});
			}, options);

			imageElements.forEach((img) => {
				if(img) observer.observe(img);
			});
		}

		return () => {
			document.removeEventListener('fullscreenchange', updateFullscreenStatus);
			// ✨ -- والتغيير هنا -- ✨
			window.clearTimeout(inactivityTimer);
			if (observer) observer.disconnect(); // تنظيف الـ observer عند مغادرة الصفحة
		};
	});

	onDestroy(() => {
		// ✨ -- والتغيير هنا -- ✨
		window.clearTimeout(inactivityTimer);
		if (observer) observer.disconnect();
	});

	$: {
		if ($readingMode === 'horizontal' && pages.length > 0) {
			const start = currentPageIndex + ($pageDisplayMode === 'double' ? 2 : 1);
			const end = start + PRELOAD_AHEAD_COUNT;
			imagesToPreload = pages
				.slice(start, end)
				.map((p) => `${baseCdnUrl}/${p.image_path}?width=1200&quality=85`);
		} else {
			imagesToPreload = [];
		}
	}

	const baseCdnUrl = 'https://dragonball-cdn.b-cdn.net';
	// صورة شفافة مؤقتة للتحميل الكسول
	const placeholderSrc =
		'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

	let isFullscreen = false;
	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'f') {
			event.preventDefault();
			toggleFullscreen();
		}

		if ($readingMode === 'horizontal') {
			const step = $pageDisplayMode === 'double' ? 2 : 1;
			if (event.key === 'ArrowRight') {
				currentPageIndex = Math.min(pages.length - 1, currentPageIndex + step);
			} else if (event.key === 'ArrowLeft') {
				currentPageIndex = Math.max(0, currentPageIndex - step);
			}
		} else {
			if (event.key === 'ArrowRight') {
				goto(`/manga/${manga.slug}/${currentChapter + 1}`);
			} else if (event.key === 'ArrowLeft') {
				goto(`/manga/${manga.slug}/${currentChapter - 1}`);
			}
		}
	}
</script>