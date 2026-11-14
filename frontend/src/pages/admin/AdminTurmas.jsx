import { useState, useEffect } from 'react'
import {
  AlertDialog,
  Badge,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  IconButton,
  Select,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Toast, ToastError } from '../../components/Toast'
import { PencilIcon, TrashIcon } from '../../components/Icons'
import { api } from '../../services/api'

const DIAS_SEMANA = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
]

const TURNO_OPCOES = ['Manhã', 'Tarde', 'Noite']

function buildTurmasWithDetails(turmas, disciplinas, professors, matriculas) {
  return turmas.map((t) => {
    const disciplina = disciplinas.find((d) => String(d.id) === String(t.disciplinaId))
    const professor = professors.find((p) => String(p.id) === String(t.professorId))
    const vagasOcupadas = matriculas.filter((m) => String(m.turmaId) === String(t.id)).length
    return {
      ...t,
      disciplinaNome: disciplina?.nome ?? '',
      professorNome: professor?.nome ?? '',
      vagasOcupadas,
    }
  })
}

export default function AdminTurmas() {
  const [turmas, setTurmas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [professors, setProfessors] = useState([])
  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTurma, setEditingTurma] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({
    disciplinaId: '',
    professorId: '',
    diaSemana: '',
    turno: '',
    limiteVagas: '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastError, setToastError] = useState(null)

  const turmasWithDetails = buildTurmasWithDetails(turmas, disciplinas, professors, matriculas)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    async function load() {
      try {
        setError(null)
        const [turmasData, disciplinasData, professorsData, matriculasData] = await Promise.all([
          api('/turmas', { signal }),
          api('/disciplinas', { signal }),
          api('/professors', { signal }),
          api('/matriculas', { signal }),
        ])
        setTurmas(Array.isArray(turmasData) ? turmasData : [])
        setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : [])
        setProfessors(Array.isArray(professorsData) ? professorsData : [])
        setMatriculas(Array.isArray(matriculasData) ? matriculasData : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Erro ao conectar. Verifique se o servidor está rodando.')
        setTurmas([])
        setDisciplinas([])
        setProfessors([])
        setMatriculas([])
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  function openNewModal() {
    setEditingTurma(null)
    setForm({
      disciplinaId: '',
      professorId: '',
      diaSemana: '',
      turno: '',
      limiteVagas: '',
    })
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(turma) {
    setEditingTurma(turma)
    setForm({
      disciplinaId: String(turma.disciplinaId),
      professorId: String(turma.professorId),
      diaSemana: turma.diaSemana,
      turno: turma.turno,
      limiteVagas: String(turma.limiteVagas),
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingTurma(null)
    setForm({
      disciplinaId: '',
      professorId: '',
      diaSemana: '',
      turno: '',
      limiteVagas: '',
    })
    setFormError('')
  }

  async function handleSaveTurma(e) {
    e.preventDefault()
    setFormError('')
    const limiteStr = form.limiteVagas.trim()
    if (!form.disciplinaId || !form.professorId || !form.diaSemana || !form.turno || !limiteStr) {
      setFormError('Preencha todos os campos.')
      return
    }
    const limite = parseInt(limiteStr, 10)
    if (isNaN(limite) || limite <= 0) {
      setFormError('Limite de vagas deve ser um número positivo.')
      return
    }
    const professorId = Number(form.professorId)
    const disciplinaId = Number(form.disciplinaId)
    const conflitoProfessor = turmas.some((t) => {
      if (editingTurma && String(t.id) === String(editingTurma.id)) return false
      return String(t.professorId) === String(professorId) && t.diaSemana === form.diaSemana && t.turno === form.turno
    })
    if (conflitoProfessor) {
      setFormError('Este professor já possui uma turma neste dia e turno.')
      return
    }
    setSaving(true)
    try {
      const body = {
        disciplinaId,
        professorId,
        diaSemana: form.diaSemana,
        turno: form.turno,
        limiteVagas: limite,
      }
      if (editingTurma) {
        const updated = await api(`/turmas/${editingTurma.id}`, {
          method: 'PUT',
          body,
        })
        setTurmas((prev) =>
          prev.map((t) => (String(t.id) === String(editingTurma.id) ? updated : t))
        )
      } else {
        const created = await api('/turmas', {
          method: 'POST',
          body,
        })
        setTurmas((prev) => [...prev, created])
      }
      setToast(editingTurma ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!')
      handleCloseModal()
    } catch (err) {
      const msg = err.message || 'Erro ao salvar. Tente novamente.'
      setFormError(msg)
      setToastError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await api(`/turmas/${deleteConfirm.id}`, { method: 'DELETE' })
      setTurmas((prev) => prev.filter((t) => String(t.id) !== String(deleteConfirm.id)))
      setDeleteConfirm(null)
      setToast('Turma excluída com sucesso!')
    } catch (err) {
      const msg = err.message || 'Erro ao excluir. Tente novamente.'
      setDeleteError(msg)
      setToastError(msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Flex direction="column" gap="5" p="6">
      <Flex justify="between" align="start" wrap="wrap" gap="4">
        <Flex direction="column" gap="1">
          <Text size="6" weight="bold">
            Turmas
          </Text>
          <Text size="2" color="gray">
            Gerencie as turmas do sistema
          </Text>
        </Flex>
        <Button size="3" onClick={openNewModal}>
          + Criar Turma
        </Button>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Text size="3" weight="bold">
            {turmas.length} turmas cadastradas
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
                  <Table.ColumnHeaderCell>Vagas</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell align="right">Ações</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {turmasWithDetails.map((t) => (
                  <Table.Row key={t.id}>
                    <Table.Cell>{t.disciplinaNome}</Table.Cell>
                    <Table.Cell>{t.professorNome}</Table.Cell>
                    <Table.Cell>{t.diaSemana}</Table.Cell>
                    <Table.Cell>
                      <Badge size="1" variant="soft" color="gray">
                        {t.turno}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text color={t.limiteVagas - t.vagasOcupadas === 0 ? 'red' : 'green'}>
                        {t.limiteVagas - t.vagasOcupadas}/{t.limiteVagas}
                      </Text>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Flex gap="2" justify="end">
                        <IconButton
                          size="2"
                          variant="ghost"
                          onClick={() => openEditModal(t)}
                          title="Editar"
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton
                          size="2"
                          variant="ghost"
                          color="red"
                          onClick={() => setDeleteConfirm(t)}
                          title="Excluir"
                        >
                          <TrashIcon />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </Flex>
      </Card>

      <Dialog.Root open={modalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <Dialog.Content style={{ maxWidth: 440 }}>
          <Dialog.Title>
            {editingTurma ? 'Editar Turma' : 'Nova Turma'}
          </Dialog.Title>
          <Dialog.Description>
            {editingTurma
              ? 'Altere os dados da turma.'
              : 'Preencha os dados para criar uma nova turma.'}
          </Dialog.Description>
          <form onSubmit={handleSaveTurma}>
            <Flex direction="column" gap="4" mt="4">
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Disciplina
                </Text>
                <Select.Root
                  value={form.disciplinaId}
                  onValueChange={(v) => setForm((f) => ({ ...f, disciplinaId: v }))}
                >
                  <Select.Trigger placeholder="Selecione a disciplina" style={{ width: '100%' }} size="3" />
                  <Select.Content>
                    {disciplinas.map((d) => (
                      <Select.Item key={d.id} value={String(d.id)}>
                        {d.nome}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Professor
                </Text>
                <Select.Root
                  value={form.professorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, professorId: v }))}
                >
                  <Select.Trigger placeholder="Selecione o professor" style={{ width: '100%' }} size="3" />
                  <Select.Content>
                    {professors.map((p) => (
                      <Select.Item key={p.id} value={String(p.id)}>
                        {p.nome}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Grid columns="2" gap="4">
                <Box>
                  <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                    Dia da Semana
                  </Text>
                  <Select.Root
                    value={form.diaSemana}
                    onValueChange={(v) => setForm((f) => ({ ...f, diaSemana: v }))}
                  >
                    <Select.Trigger placeholder="Selecione" style={{ width: '100%' }} size="3" />
                    <Select.Content>
                      {DIAS_SEMANA.map((dia) => (
                        <Select.Item key={dia} value={dia}>
                          {dia}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                    Turno
                  </Text>
                  <Select.Root
                    value={form.turno}
                    onValueChange={(v) => setForm((f) => ({ ...f, turno: v }))}
                  >
                    <Select.Trigger placeholder="Selecione" style={{ width: '100%' }} size="3" />
                    <Select.Content>
                      {TURNO_OPCOES.map((turno) => (
                        <Select.Item key={turno} value={turno}>
                          {turno}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Grid>
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Limite de Vagas
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="Ex: 40"
                  value={form.limiteVagas}
                  onChange={(e) => setForm((f) => ({ ...f, limiteVagas: e.target.value }))}
                  size="3"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Box>
              {formError && (
                <Text size="2" color="red">
                  {formError}
                </Text>
              )}
              <Flex gap="3" justify="end" mt="2">
                <Dialog.Close>
                  <Button type="button" variant="soft" color="gray">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : editingTurma ? 'Salvar' : 'Criar Turma'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={!!deleteConfirm} onOpenChange={(open) => !open && (setDeleteConfirm(null), setDeleteError(null), setDeleting(false))}>
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Excluir Turma</AlertDialog.Title>
          <AlertDialog.Description>
            Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.
          </AlertDialog.Description>
          {deleteError && (
            <Text size="2" color="red" mt="2">
              {deleteError}
            </Text>
          )}
          <Flex gap="3" justify="end" mt="4">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={deleting}>
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <Button color="red" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {toastError && <ToastError message={toastError} onClose={() => setToastError(null)} />}
    </Flex>
  )
}
