from flask import Flask, request, jsonify
from app import db
from app.models import Aluno, Disciplina, Nota

def init_routes(app):
    # -------------------- POST --------------------
    @app.route("/alunos", methods=["POST"])
    def adicionar_aluno():
        data = request.get_json()
        nome = data.get("nome")

        if not nome:
            return jsonify({"erro": "Nome do aluno é obrigatório"}), 400

        if Aluno.query.filter_by(nome=nome).first():
            return jsonify({"erro": "Aluno já existe"}), 400

        aluno = Aluno(nome=nome)
        db.session.add(aluno)
        db.session.commit()
        return jsonify({"mensagem": f"{nome} adicionado"}), 201

    @app.route("/notas", methods=["POST"])
    def atribuir_nota():
        data = request.get_json()
        aluno_id = data.get("aluno_id")
        disciplina_id = data.get("disciplina_id")
        valor = data.get("valor")

        if None in [aluno_id, disciplina_id, valor]:
            return jsonify({"erro": "Campos aluno_id, disciplina_id e valor são obrigatórios"}), 400

        if not (0 <= valor <= 10):
            return jsonify({"erro": "Valor da nota deve estar entre 0 e 10"}), 400

        aluno = Aluno.query.get(aluno_id)
        disciplina = Disciplina.query.get(disciplina_id)

        if not aluno or not disciplina:
            return jsonify({"erro": "Aluno ou disciplina não encontrado"}), 404

        nota = Nota.query.filter_by(aluno_id=aluno_id, disciplina_id=disciplina_id).first()
    
        if nota:
            nota.valor = valor
            mensagem = f"Nota de {aluno.nome} atualizada com sucesso"
        else:
            nota = Nota(aluno_id=aluno_id, disciplina_id=disciplina_id, valor=valor)
            db.session.add(nota)
            mensagem = f"Nota atribuída com sucesso a {aluno.nome}"

        db.session.commit()
        return jsonify({"mensagem": f"Nota atribuída com sucesso a {aluno.nome}"}), 200

    @app.route("/presencas", methods=["POST"])
    def atribuir_presenca():
        data = request.get_json()
        aluno_id = data.get("aluno_id")
        presencas = data.get("presencas", 1)  # valor default = 1 presença

        aluno = Aluno.query.get(aluno_id)
        if not aluno:
            return jsonify({"erro": "Aluno não encontrado"}), 404

        aluno.presencas += presencas
        if aluno.presencas > 200:  # TOTAL_AULAS
            aluno.presencas = 200

        db.session.commit()
        return jsonify({
            "mensagem": f"{presencas} presença(s) atribuída(s) a {aluno.nome}",
            "total_presencas": aluno.presencas,
            "frequencia": aluno.frequencia()
        }), 200

    # -------------------- GET --------------------
    @app.route("/alunos", methods=["GET"])
    def listar_alunos():
        alunos = Aluno.query.all()
        result = []
        for aluno in alunos:
            result.append({
                "id": aluno.id,
                "nome": aluno.nome,
                "presencas": aluno.presencas,
                "frequencia": aluno.frequencia()
            })
        return jsonify(result), 200

    @app.route("/alunos/<int:aluno_id>", methods=["GET"])
    def detalhar_aluno(aluno_id):
        aluno = Aluno.query.get(aluno_id)
        if not aluno:
            return jsonify({"erro": "Aluno não encontrado"}), 404

        notas = []
        for nota in aluno.notas:
            notas.append({
                "id": nota.id,  
                "disciplina": nota.disciplina.nome,  
                "valor": nota.valor
            })

        # calcular média geral
        media = round(sum(n['valor'] for n in notas)/len(notas), 2) if notas else None

        return jsonify({
            "id": aluno.id,
            "nome": aluno.nome,
            "presencas": aluno.presencas,
            "frequencia": aluno.frequencia(),
            "notas": notas,
            "media": media
        }), 200

    @app.route("/disciplinas", methods=["GET"])
    def listar_disciplinas():
        disciplinas = Disciplina.query.all()
        result = [{"id": d.id, "nome": d.nome} for d in disciplinas]
        return jsonify(result), 200

    @app.route("/notas", methods=["GET"])
    def listar_notas():
        notas = Nota.query.all()
        result = []
        for nota in notas:
            result.append({
                "aluno": nota.aluno.nome,
                "disciplina": nota.disciplina.nome,
                "valor": nota.valor
            })
        return jsonify(result), 200
