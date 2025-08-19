from app import create_app, db
from app.models import Aluno, Disciplina, Nota

app = create_app()

#popular bd
with app.app_context():
    materias = ["Matemática", "Português", "História", "Geografia", "Ciências"]
    for nome in materias:
        if not Disciplina.query.filter_by(nome=nome).first():
            db.session.add(Disciplina(nome=nome))
    db.session.commit()

    alunos = ["Ana", "Bruno", "Carla", "Diego"]
    for nome in alunos:
        if not Aluno.query.filter_by(nome=nome).first():
            db.session.add(Aluno(nome=nome, presencas=5))
    db.session.commit()

    disciplinas = {d.nome: d for d in Disciplina.query.all()}
    alunos = {a.nome: a for a in Aluno.query.all()}

    exemplos_notas = [
        ("Ana", "Matemática", 8.5),
        ("Ana", "Português", 6.5),
        ("Ana", "História", 4.5),
        ("Ana", "Ciências", 8.5),
        ("Ana", "Geografia", 7.0),
        ("Bruno", "História", 9.0),
        ("Bruno", "Matemática", 9.0),
        ("Bruno", "Português", 1.0),
        ("Bruno", "Geografia", 10.0),
        ("Bruno", "Ciências", 4.3),
        ("Carla", "Geografia", 6.5),
        ("Carla", "Matemática", 6.9),
        ("Carla", "Ciências", 7.6),
        ("Carla", "Português", 4.7),
        ("Carla", "História", 6.6),
        ("Diego", "Ciências", 8.0),
        ("Diego", "Matemática", 9.8),
        ("Diego", "Português", 3.2),
        ("Diego", "História", 4.4),
        ("Diego", "Geografia", 8.7),
    ]

    for aluno_nome, materia_nome, valor in exemplos_notas:
        aluno = alunos[aluno_nome]
        disciplina = disciplinas[materia_nome]

        if not Nota.query.filter_by(aluno_id=aluno.id, disciplina_id=disciplina.id).first():
            db.session.add(Nota(aluno_id=aluno.id, disciplina_id=disciplina.id, valor=valor))
    db.session.commit()
