# SGN-dti
Sistema de gestão de notas de alunos

Carlos é um professor do Ensino Fundamental I e quer um sistema para gerenciar as notas e frequência dos alunos fora do sistema acadêmico da própria escola. Ele leciona todas as disciplinas e a freqência dos alunos é geral (contabilizada a cada dia e com valor de dias letivos fixo = 200).

Tendo em vista os requisitos do projeto é ṕossível perceber que não há necessidade de uma grande complexidade de arquitetura, se tratando de um sistema de uso pessoal e simples. Por isso foi escolhido utilizar python + flask para o back-end, uma vez que isso torna a produção rápida e simples e atende todas as necesidades do cliente. O BD escolhido foi o SQLite pelos mesmos motivos. O front-end da aplicação é feito em React.

0. (opcional) gerar um ambiente virtual e baixar as dependências com **pip install -r requirements.txt**
1. inicializar back-end: **python run.py**
2. (opcional) popular bd: **python seed.py**
3. inicializar front-end: **cd web**  
                          **npm run dev**



