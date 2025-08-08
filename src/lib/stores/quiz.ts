// src/lib/stores/quiz.ts
import { writable } from 'svelte/store';

export interface Question {
	id: string;
	text: string;
	option_1: string;
	option_2: string;
	option_3: string;
	option_4: string;
	order: number;
	// ---  الإصلاح: إضافة الخاصية الجديدة هنا ---
	imageUrl?: string;
}

interface UserAnswer {
	questionId: string;
	selectedOption: number;
}

interface QuizState {
	questions: Question[];
	userAnswers: UserAnswer[];
	currentQuestionIndex: number;
	isCompleted: boolean;
}

function createQuizStore() {
	const { subscribe, set, update } = writable<QuizState>({
		questions: [],
		userAnswers: [],
		currentQuestionIndex: 0,
		isCompleted: false
	});

	return {
		subscribe,
		startQuiz: (questions: Question[]) => {
			set({
				questions,
				userAnswers: [],
				currentQuestionIndex: 0,
				isCompleted: false
			});
		},
		answerQuestion: (questionId: string, selectedOption: number) => {
			update((state) => {
				state.userAnswers.push({ questionId, selectedOption });
				if (state.currentQuestionIndex < state.questions.length - 1) {
					state.currentQuestionIndex++;
				} else {
					state.isCompleted = true;
				}
				return state;
			});
		},
		reset: () =>
			set({
				questions: [],
				userAnswers: [],
				currentQuestionIndex: 0,
				isCompleted: false
			})
	};
}

export const quizStore = createQuizStore();