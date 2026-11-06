import type { LucideIcon } from 'lucide-react'
import { BookOpen, Brain, BriefcaseBusiness, CalendarDays, ClipboardCheck, FileText, GraduationCap, Headphones, Lightbulb, MessageCircleQuestion } from 'lucide-react'

export type Feature = {
  id: string
  title: string
  description: string
  icon: LucideIcon
  accent: string
  prompt: string
}

export const features: Feature[] = [
  { id: 'teacher', title: 'AI Teacher', description: 'Step-by-step lessons made simple.', icon: GraduationCap, accent: '#5b5ce2', prompt: 'Explain academic concepts as a patient virtual teacher.' },
  { id: 'tutor', title: 'AI Tutor', description: 'Practice, hints, and adaptive learning.', icon: Brain, accent: '#e88647', prompt: 'Teach one concept at a time and ask a practice question.' },
  { id: 'doubt-solver', title: 'AI Doubt Solver', description: 'Clear answers to difficult questions.', icon: MessageCircleQuestion, accent: '#2ba98b', prompt: 'Solve the student doubt with a clear, step-by-step explanation.' },
  { id: 'exam-assistant', title: 'AI Exam Assistant', description: 'Prepare with focused revision.', icon: ClipboardCheck, accent: '#d65679', prompt: 'Help prepare for an exam with practice questions and model answers.' },
  { id: 'notes-generator', title: 'AI Notes Generator', description: 'Turn topics into useful notes.', icon: FileText, accent: '#4c91d7', prompt: 'Create accurate academic notes from the supplied topic or text.' },
  { id: 'quiz-generator', title: 'AI Quiz Generator', description: 'Test knowledge and track progress.', icon: Lightbulb, accent: '#d5a12b', prompt: 'Generate an educational quiz and explain each answer.' },
  { id: 'study-planner', title: 'AI Study Planner', description: 'Build a plan you can follow.', icon: CalendarDays, accent: '#7d62c7', prompt: 'Create a realistic study plan based on the student goals and schedule.' },
  { id: 'career-guide', title: 'AI Career Guide', description: 'Explore pathways and possibilities.', icon: BriefcaseBusiness, accent: '#358f9e', prompt: 'Offer balanced career guidance and learning roadmaps, not guarantees.' },
  { id: 'voice-teacher', title: 'AI Voice Teacher', description: 'Learn through spoken interaction.', icon: Headphones, accent: '#d5693a', prompt: 'Answer the spoken educational question in a friendly teaching style.' },
  { id: 'teacher-assistant', title: 'Teacher Assistant', description: 'Create classroom-ready material.', icon: BookOpen, accent: '#5d8a43', prompt: 'Create useful classroom material for the selected subject and class.' },
]
