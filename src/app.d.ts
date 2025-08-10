declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('pocketbase').Record | import('pocketbase').Admin | null;
			admin?: boolean;
			// --- الإضافة الجديدة ---
			dragonBall?: {
				ball_number: number;
				find_token: string;
			};
			// --- نهاية الإضافة ---
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
