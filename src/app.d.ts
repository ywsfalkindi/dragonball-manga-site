declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('pocketbase').Record | import('pocketbase').Admin | null;
			admin?: boolean;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};