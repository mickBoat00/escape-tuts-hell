import api from './axios';
import type { Tutorial } from './types';

export async function getTutorial(tutorialId: string): Promise<Tutorial> {
  try {
    const response = await api.get<Tutorial>(`/tutorials/${tutorialId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Tutorial not found');
    }
    throw new Error(error.response?.data?.detail || 'Failed to fetch tutorial');
  }
}

export async function deleteTutorial(tutorialId: string): Promise<void> {
  try {
    await api.delete(`/tutorials/${tutorialId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to delete tutorial');
  }
}

export async function getAllTutorials(): Promise<Tutorial[]> {
  try {
    const response = await api.get<Tutorial[]>('/tutorials');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch tutorials');
  }
}