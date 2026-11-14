import { useState, useEffect } from 'react'
import {
  AlertDialog,
  Badge,
  Button,
  Card,
  Flex,
  Table,
  Text,
} from '@radix-ui/themes'
import { useAuth } from '../../contexts/AuthContext'
import { CloseIcon } from '../../components/Icons'
import { api } from '../../services/api'

function buildMatriculasWithDetails(matriculas, turmas, disciplinas, professors) {
  return matriculas.map((m) => {
    const turma = turmas.find((t) => String(t.id) === String(m.turmaId))
    const disciplina = turma ? disciplinas.find((d) => String(d.id) === String(turma.disciplinaId)) : null
    const professor = turma ? professors.find((p) => String(p.id) === String(turma.professorId)) : null
    return {
      ...m,
      disciplinaNome: disciplina?.nome ?? '',
      professorNome: professor?.nome ?? '',
      diaSemana: turma?.diaSemana ?? '',
      turno: turma?.turno ?? '',
    }
  })
}

export default function AlunoMinhasMatriculas() {
  const { user } = useAuth()
  const [matriculas, setMatriculas] = useState([])
  const [turmas, setTurmas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [professors, setProfessors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const alunoId = user?.id != null ? String(user.id) : null
  const myMatriculas = matriculas.filter((m) => String(m.alunoId) === alunoId)
  const myMatriculasWithDetails = buildMatriculasWithDetails(myMatriculas, turmas, disciplinas, professors)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    async function load() {
      try {
        setError(null)
        const [matriculasData, turmasData, disciplinasData, professorsData] = await Promise.all([
          api('/matriculas', { signal }),
          api('/turmas', { signal }),
          api('/disciplinas', { signal }),
          api('/professors', { signal }),
        ])
        setMatriculas(Array.isArray(matriculasData) ? matriculasData : [])
        setTurmas(Array.isArray(turmasData) ? turmasData : [])
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : [])
        setProfessors(Array.isArray(professorsData) ? professorsData : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Erro ao conectar. Verifique se o servidor está rodando.')
        setMatriculas([])
        setTurmas([])
        setDisciplinas([])
        setProfessors([])
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  async function handleConfirmCancelar() {
    if (!cancelConfirm) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await api(`/matriculas/${cancelConfirm.id}`, { method: 'DELETE' })
      setMatriculas((prev) => prev.filter((m) => String(m.id) !== String(cancelConfirm.id)))
      setCancelConfirm(null)
    } catch (err) {
      setDeleteError(err.message || 'Erro ao cancelar. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Flex direction="column" gap="5" p="6">
      <Flex direction="column" gap="1">
        <Text size="6" weight="bold">
          Minhas Matrículas
        </Text>
        <Text size="2" color="gray">
          Gerencie suas matrículas ativas
        </Text>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Text size="3" weight="bold">
            {myMatriculasWithDetails.length} matrículas ativas
          </Text>
          {error && (
            <Text size="2" color="red">
              {error}
            </Text>
          )}
          {loading ? (
            <Text size="2" color="gray">
              Carregando...
            </Text>
          ) : (
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Disciplina</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Professor</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Dia da Semana</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Turno</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell align="right">Ação</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {myMatriculasWithDetails.map((m) => (
                  <Table.Row key={m.id}>
                    <Table.Cell>{m.disciplinaNome}</Table.Cell>
                    <Table.Cell>{m.professorNome}</Table.Cell>
                    <Table.Cell>{m.diaSemana}</Table.Cell>
                    <Table.Cell>
                      <Badge size="1" variant="soft" color="blue">
                        {m.turno}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={() => setCancelConfirm(m)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CloseIcon />
                        Cancelar
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Flex>
      </Card>

      <AlertDialog.Root open={!!cancelConfirm} onOpenChange={(open) => !open && (setCancelConfirm(null), setDeleteError(null), setDeleting(false))}>
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Cancelar Matrícula</AlertDialog.Title>
          <AlertDialog.Description>
            Tem certeza que deseja cancelar esta matrícula? Você poderá se matricular novamente, caso haja vagas.
          </AlertDialog.Description>
          {deleteError && (
            <Text size="2" color="red" mt="2">
              {deleteError}
            </Text>
          )}
          <Flex gap="3" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={deleting}>
                Voltar
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={handleConfirmCancelar} disabled={deleting}>
              {deleting ? 'Cancelando...' : 'Cancelar matrícula'}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  )
}
