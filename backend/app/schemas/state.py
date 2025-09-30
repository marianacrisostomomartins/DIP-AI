from pydantic import BaseModel
from typing import List, Optional, Literal
import json
import logging

from app.prompts.update_suggestions import suggestions_prompt

logging.basicConfig(level=logging.INFO)

Language = Literal["pt", "en"]


class CanvasField(BaseModel):
    id: int
    title: str
    question: str
    question_suggestion: Optional[str] = None
    answer_suggestion: Optional[str] = None
    answer: Optional[str] = None


class CanvasState(BaseModel):
    fields: List[CanvasField]
    suggestion_error: Optional[str] = None

    def __init__(self, **data):
        if 'fields' not in data:
            language = data.get('language', 'pt')
            data['fields'] = init_canvas(language)
        super().__init__(**data)        
    

    def get_canvas(self) -> dict:
        canvas = {}
        for field in self.fields:
            canvas[field.id] = {
                "title": field.title,
                "question": field.question
            }
            if field.question_suggestion:
                canvas[field.id]["question_suggestion"] = field.question_suggestion
            if field.answer_suggestion:
                canvas[field.id]["answer_suggestion"] = field.answer_suggestion
            if field.answer:
                canvas[field.id]["answer"] = field.answer
        return canvas
        
    
    def set_field_answer(self, field_id: int, answer: str):
        for field in self.fields:
            if field.id == field_id:
                field.answer = answer
                return
        raise ValueError(f"Field with id {field_id} not found.")
    

    async def update_suggestions(self, llm):
        """
        Atualiza as sugestões de perguntas e respostas para cada campo do Canva usando o modelo de linguagem.
        Se houver erro na resposta ou tratamento das sugestões da LLM, o fluxo continua normalmente sem atualizar sugestões.
        Sinaliza o erro para o frontend via atributo suggestion_error.
        """
        self.suggestion_error = None
        try:
            suggestions = await llm.ask(suggestions_prompt.format(state=self.get_canvas()))
            suggestions = llm.clean_reasoning_response(suggestions)
            suggestions = llm.clean_makdown_json(suggestions)
            logging.debug(f"Sugestões recebidas da LLM: {suggestions}")
            suggestions = json.loads(suggestions)
            for field in self.fields:
                suggestion = next((s for s in suggestions['fields'] if s['id'] == field.id), None)
                if suggestion:
                    field.question_suggestion = suggestion.get('question_suggestion', '')
                    field.answer_suggestion = suggestion.get('answer_suggestion', '')
        except Exception as e:
            self.suggestion_error = str(e)
            logging.error(f"Erro ao atualizar sugestões da LLM: {e}")


def init_canvas(language: Language = "pt") -> List[CanvasField]:
    if language == "en":
        questions = [
            {"title": "Business objective", "question": "Present the general objective of the organization."},
            {"title": "Justifications", "question": "Why does this organization operate in this scenario?"},
            {"title": "Benefits", "question": "How does the organization add value to customers?"},
            {"title": "KPIs", "question": "Indicate the most important indices or those that the business needs to pay more attention to (e.g. profit, customer satisfaction, costs, etc.)."},
            {"title": "Processes to achieve the objective", "question": "What processes and activities exist in the organization?"},
            {"title": "Problems that need to be addressed", "question": "Have existing problems and/or processes that can be improved been identified? If so, which ones?"},
            {"title": "Tasks for each process", "question": "What activities are involved in each process or problem (describe step by step)?"},
            {"title": "Why", "question": "How do these processes help in decisions and improvements of activities in the organization?"},
            {"title": "How it's done", "question": "How is each process performed?"},
            {"title": "People involved", "question": "Who are the responsible parties, who performs and who is affected by each process or problem?"},
            {"title": "Where", "question": "In what location of the organization do these processes or problems occur?"},
            {"title": "How often", "question": "How often is each process performed (daily, weekly, etc)?"},
            {"title": "Severity", "question": "Rate from 1 to 5 the severity of each problem or process."},
            {"title": "Urgency", "question": "Rate from 1 to 5 the urgency of addressing each problem or process."},
            {"title": "Tendency to worsen", "question": "Rate from 1 to 5 the tendency for each problem or process to worsen."},
            {"title": "Multiplication", "question": "Multiply the severity, urgency and tendency values for each process."},
            {"title": "Data tasks", "question": "What data tasks for each problem or process (e.g. automation, classification, etc)?"},
            {"title": "How it helps the customer", "question": "What is the added value of the solution for the customer and what metrics to evaluate if each solution helps the customer?"},
            {"title": "Required data", "question": "What data is needed to address each problem or process?"},
            {"title": "Priority problem", "question": "What problems or processes selected from the previous phase to be addressed in this project?"},
            {"title": "Input data", "question": "What data is expected to develop the solution, if they exist, what are the data formats and where are they stored?"},
            {"title": "Data quality", "question": "What data quality characteristics are most important for a perfect dataset?"},
            {"title": "Output data", "question": "What is the expected output and how should it be presented (e.g. dashboard, application, etc)?"},
            {"title": "Performance metrics", "question": "What are the best metrics to evaluate this solution?"},
            {"title": "Risks", "question": """Identify the risks inherent to this project with the following characteristics (description, impact, probability and contingency)
                * description: identify risks
                * impact: judge the impact of each risk (e.g. project delays)
                * probability: inform the probability of the risk happening as low, medium and high
                * contingency: describe the actions to be taken if the risk happens"""},
            {"title": "Algorithms", "question": "What known algorithms to address this type of problem?"},
            {"title": "Baseline", "question": "List the known baseline for this type of problem or similar problems."},
            {"title": "References", "question": "List articles and references used to understand and address aspects of the problem."}
        ]
    else:
        questions = [
            {"title": "Objetivo do negócio", "question": "Apresente o objetivo geral da organização."},
            {"title": "Justificativas", "question": "Por quê essa organização atua nesse cenário?"},
            {"title": "Benefícios", "question": "Como a organização agrega valor aos clientes?"},
            {"title": "KPIs", "question": "Indique os índices mais importantes ou aqueles que o negócio precisa dar mais atenção (ex. lucro, satisfação dos clientes, custos, etc.)."},
            {"title": "Processos para atingir o objetivo", "question": "Quais processos e atividades existem na organização?"},
            {"title": "Problemas necessários de serem tratados", "question": "Já foram identificados problemas existentes e/ou processos que podem ser melhorados? Se sim, quais?"},
            {"title": "Tarefas de cada processo", "question": "Quais as atividades envolvidas em cada processo ou problema (descreva o passo a passo)?"},
            {"title": "Por quê", "question": "Como esses processos auxiliam em decisões e melhorias das atividades na organização?"},
            {"title": "Como é feito", "question": "Como cada processo é realizado?"},
            {"title": "Envolvidos", "question": "Quem são os responsáveis, quem realiza e quem é afetado por cada processo ou problema?"},
            {"title": "Onde", "question": "Em que local da organização esses processos ou problemas acontecem?"},
            {"title": "Com que frequência", "question": "Com que frequência cada processo é realizado (diária, semanal, etc)?"},
            {"title": "Gravidade", "question": "Julgue de 1 a 5 a gravidade de cada problema ou processo."},
            {"title": "Urgência", "question": "Julgue de 1 a 5 a urgência de tratar cada problema ou processo."},
            {"title": "Tendência a piorar", "question": "Julgue de 1 a 5 a tendência de tratar cada problema ou processo piorar."},
            {"title": "Multiplicação", "question": "Multiplique o valor de gravidade, urgência e tendência de cada processo."},
            {"title": "Tarefa de dados", "question": "Quais tarefas de dados de cada problema ou processo (ex. automatização, classificação, etc)?"},
            {"title": "Como ajuda o cliente", "question": "Qual o valor agregado da solução para o cliente e quais métricas para avaliar se cada solução ajuda o cliente?"},
            {"title": "Dados necessários", "question": "Quais são os dados necessários para tratar cada problema ou processo?"},
            {"title": "Problema prioritário", "question": "Quais os problemas ou processos selecionados da fase anterior para ser tratado nesse projeto?"},
            {"title": "Dados de entrada", "question": "Quais dados esperados para desenvolver a solução, se existem, quais os formatos dos dados e onde estão armazenados?"},
            {"title": "Qualidade dos dados", "question": "Quais características de qualidade dos dados mais importantes para um dataset perfeito?"},
            {"title": "Dados de saída", "question": "Qual a saída esperada e como deve ser apresentada (ex. dashboard, aplicação, etc)?"},
            {"title": "Métricas de desempenho", "question": "Quais as melhores métricas para avaliar essa solução?"},
            {"title": "Riscos", "question": """Identifique os riscos inerentes a esse projeto com as características a seguir (descrição, impacto, probabilidade e contigência)
                * descrição: identifique riscos
                * impacto: julgue o impacto de cada risco (ex. atrasos no projeto)
                * probabilidade: informe a probabilidade dos risco acontecer como baixa, média e alta
                * contingência:  descreva as ações a serem tomadas caso o risco aconteça"""},
            {"title": "Algoritmos", "question": "Quais os algoritmos conhecidos para tratar esse tipo de problema?"},
            {"title": "Baseline", "question": "Liste a baseline conhecida para esse tipo de problema ou problemas semelhantes."},
            {"title": "Referências", "question": "Liste artigos e referências usadas para conhecer e tratar aspectos do problema."}
        ]
    
    fields = [CanvasField(id=i+1, title=q["title"], question=q["question"]) for i, q in enumerate(questions)]
    return fields
