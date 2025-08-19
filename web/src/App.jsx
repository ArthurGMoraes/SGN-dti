import React, { useEffect, useState } from "react";

function App() {
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [novoAluno, setNovoAluno] = useState("");
  const [alunoNotaId, setAlunoNotaId] = useState("");
  const [disciplinaNotaId, setDisciplinaNotaId] = useState("");
  const [valorNota, setValorNota] = useState("");

  useEffect(() => {
    buscarAlunos();
    buscarDisciplinas();
  }, []);

  const buscarAlunos = async () => {
    const res = await fetch("http://127.0.0.1:5000/alunos");
    const dados = await res.json();

    const alunosComNotas = await Promise.all(
      dados.map(async (aluno) => {
        const resDetalhe = await fetch(
          `http://127.0.0.1:5000/alunos/${aluno.id}`
        );
        const detalhes = await resDetalhe.json();

        let materias = {};
        let mediasPorMateria = {};
        detalhes.notas.forEach((nota) => {
          if (!materias[nota.disciplina]) materias[nota.disciplina] = [];
          materias[nota.disciplina].push(nota.valor);
        });

        Object.keys(materias).forEach((d) => {
          let soma = materias[d].reduce((a, b) => a + b, 0);
          mediasPorMateria[d] = soma / materias[d].length;
        });

        let todasNotas = Object.values(materias).flat();
        let mediaAluno =
          todasNotas.length > 0
            ? todasNotas.reduce((a, b) => a + b, 0) / todasNotas.length
            : 0;

        return {
          ...aluno,
          materias,
          mediasPorMateria,
          mediaAluno,
        };
      })
    );

    setAlunos(alunosComNotas);
  };

  const buscarDisciplinas = async () => {
    const res = await fetch("http://127.0.0.1:5000/disciplinas");
    const data = await res.json();
    setDisciplinas(data.map((d) => d.nome));
  };

  const atualizarPresenca = async (id, delta) => {
    await fetch("http://127.0.0.1:5000/presencas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aluno_id: id, presencas: delta }),
    });
    buscarAlunos();
  };

  const adicionarAluno = async () => {
    if (!novoAluno) return alert("Digite o nome do aluno");

    await fetch("http://127.0.0.1:5000/alunos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoAluno }),
    });

    setNovoAluno("");
    buscarAlunos();
  };

  const adicionarNota = async () => {
    if (!alunoNotaId || !disciplinaNotaId || !valorNota)
      return alert("Preencha todos os campos da nota");

    await fetch("http://127.0.0.1:5000/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aluno_id: parseInt(alunoNotaId),
        disciplina_id: parseInt(disciplinaNotaId),
        valor: parseFloat(valorNota),
      }),
    });

    setAlunoNotaId("");
    setDisciplinaNotaId("");
    setValorNota("");
    buscarAlunos();
  };

  // --- Cálculo dos alunos com problemas ---
  const mediaDaSala =
    alunos.length > 0
      ? alunos.reduce((soma, a) => soma + a.mediaAluno, 0) / alunos.length
      : 0;

  const alunosFrequenciaBaixa = alunos.filter((a) => a.frequencia < 75);
  const alunosAcimaMedia = alunos.filter((a) => a.mediaAluno > mediaDaSala);

  // --- Função para renderizar tabela ---
  const renderTabela = (lista) => (
    <table border="1" className="w-full mb-6">
      <thead>
        <tr>
          <th>Aluno</th>
          {disciplinas.map((d) => (
            <th key={d}>{d}</th>
          ))}
          <th>Média</th>
          <th>Presenças</th>
          <th>Frequência</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {lista.map((aluno) => (
          <tr key={aluno.id}>
            <td>{aluno.nome}</td>
            {disciplinas.map((d) => (
              <td key={d}>
                {aluno.materias[d] ? aluno.materias[d].join(", ") : "-"} (
                {aluno.mediasPorMateria[d]?.toFixed(1) || "-"})
              </td>
            ))}
            <td>{aluno.mediaAluno.toFixed(1)}</td>
            <td>{aluno.presencas}</td>
            <td>{aluno.frequencia.toFixed(1)}%</td>
            <td>
              <button
                onClick={() => atualizarPresenca(aluno.id, 1)}
                className="px-2 py-1 bg-green-500 text-white rounded mr-1"
              >
                + Presença
              </button>
              <button
                onClick={() => atualizarPresenca(aluno.id, -1)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                - Presença
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestão de Alunos</h1>

      {/* Formulário para adicionar aluno */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Adicionar Aluno</h2>
        <input
          type="text"
          value={novoAluno}
          onChange={(e) => setNovoAluno(e.target.value)}
          placeholder="Nome do aluno"
          className="border p-2 mr-2"
        />
        <button
          onClick={adicionarAluno}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Adicionar
        </button>
      </div>

      {/* Formulário para adicionar nota */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Adicionar Nota</h2>
        <select
          value={alunoNotaId}
          onChange={(e) => setAlunoNotaId(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="">Selecione o aluno</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>

        <select
          value={disciplinaNotaId}
          onChange={(e) => setDisciplinaNotaId(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="">Selecione a disciplina</option>
          {disciplinas.map((d, idx) => (
            <option key={idx} value={idx + 1}>
              {d}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          value={valorNota}
          onChange={(e) => setValorNota(e.target.value)}
          placeholder="Nota"
          className="border p-2 mr-2"
        />

        <button
          onClick={adicionarNota}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Adicionar Nota
        </button>
      </div>

      {/* Tabela geral */}
      <h2 className="text-lg font-bold mb-2">Todos os Alunos</h2>
      {renderTabela(alunos)}

      {/* Alunos com frequência baixa */}
      <h2 className="text-lg font-bold mt-6 text-red-600">
        Alunos com Frequência &lt; 75%
      </h2>
      <ul className="list-disc pl-6">
        {alunosFrequenciaBaixa.map((a) => (
          <li key={a.id}>
            {a.nome} — {a.frequencia.toFixed(1)}%
          </li>
        ))}
      </ul>

      {/* Alunos acima da média da sala */}
      <h2 className="text-lg font-bold mt-6 text-green-600">
        Alunos acima da média da sala (média da sala: {mediaDaSala.toFixed(1)})
      </h2>
      <ul className="list-disc pl-6">
        {alunosAcimaMedia.map((a) => (
          <li key={a.id}>
            {a.nome} — média {a.mediaAluno.toFixed(1)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
