// src/lib/stores/dragonballs.ts
import { writable } from 'svelte/store';

export const collectedBallsStore = writable<number[]>([]);