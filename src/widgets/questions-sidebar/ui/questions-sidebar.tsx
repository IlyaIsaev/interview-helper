import { CreateQuestionButton } from '@/features/questions/create-question'
import { QuestionsSidebar as QuestionsSidebarView } from '@/entities/questions/sidebar'
import { questionPath } from '@/shared/config'

export const QuestionsSidebar = () => {
  return (
    <QuestionsSidebarView
      headerAction={<CreateQuestionButton />}
      renderQuestion={(question, questionId) => (
        <a href={questionPath(questionId)}>{question}</a>
      )}
    />
  )
}
