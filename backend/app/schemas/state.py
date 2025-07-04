from pydantic import BaseModel
from typing import List, Optional
import json
import logging

from app.prompts.update_suggestions import suggestions_prompt

logging.basicConfig(level=logging.INFO)


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
            data['fields'] = init_canvas()
        super().__init__(**data)
    

    # def get_canvas(self) -> dict:
    #     canvas = {}
    #     for field in self.fields:
    #         canvas[field.id] = {
    #             "title": field.title,
    #             "question": field.question
    #         }
    #         if field.question_suggestion:
    #             canvas[field.id]["question_suggestion"] = field.question_suggestion
    #         if field.answer_suggestion:
    #             canvas[field.id]["answer_suggestion"] = field.answer_suggestion
    #         if field.answer:
    #             canvas[field.id]["answer"] = field.answer
    #     return canvas
        
    
    def set_field_answer(self, field_id: int, answer: str):
        for field in self.fields:
            if field.id == field_id:
                field.answer = answer
                break
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


# Inicialização do Canvas
def init_canvas() -> CanvasState:
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
