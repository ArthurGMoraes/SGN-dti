from app import db
from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship

TOTAL_AULAS = 200 # o número de aulas é fixo (200 dias letivos)

class Aluno(db.Model):
    __tablename__ = "alunos"
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    presencas = Column(Integer, default=0)
    notas = relationship("Nota", back_populates="aluno", cascade="all, delete-orphan")

    def frequencia(self):
        return (self.presencas / TOTAL_AULAS) * 100

class Disciplina(db.Model):
    __tablename__ = "disciplinas"
    id = Column(Integer, primary_key=True)
    nome = Column(String, unique=True, nullable=False)
    notas = relationship("Nota", back_populates="disciplina")

class Nota(db.Model):
    __tablename__ = "notas"
    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id"))
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id"))
    valor = Column(Float, nullable=False)  # 0 a 10
    aluno = relationship("Aluno", back_populates="notas")
    disciplina = relationship("Disciplina", back_populates="notas")

   
