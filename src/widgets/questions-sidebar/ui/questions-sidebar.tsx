import { QuestionsSidebar as QuestionsSidebarView } from '@/entities/questions/sidebar'
import { CreateQuestionButton } from '@/features/questions/create-question'
import { UpdateQuestionButton } from '@/features/questions/update-question'
import { questionPath } from '@/shared/config'

export const QuestionsSidebar = () => {
  return (
    <QuestionsSidebarView
      headerAction={<CreateQuestionButton />}
      renderQuestion={(question, questionId) => (
        <a href={questionPath(questionId)}>{question}</a>
      )}
      renderQuestionAction={(questionId) => (
        <UpdateQuestionButton questionId={questionId} />
      )}
    />
  )
}
