import { useState, useEffect } from 'react'
import {
  AlertDialog,
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  IconButton,
  Table,
  Text,
  TextField,
} from '@radix-ui/themes'
import { Toast, ToastError } from '../../components/Toast'
import { PencilIcon, TrashIcon } from '../../components/Icons'
import { api } from '../../services/api'

export default function AdminDisciplinas() {
  const [disciplinas, setDisciplinas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState({ codigo: '', nome: '', cargaHoraria: '' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastError, setToastError] = useState(null)

  useEffect(() => {
    async function loadDisciplinas() {
      try {
        setError(null)
        const data = await api('/disciplinas')
        setDisciplinas(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Erro ao conectar. Verifique se o servidor está rodando.')
        setDisciplinas([])
      } finally {
        setLoading(false)
      }
    }
    loadDisciplinas()
  }, [])

  function openNewModal() {
    setEditingDisciplina(null)
    setForm({ codigo: '', nome: '', cargaHoraria: '' })
    setFormError('')
    setModalOpen(true)
  }

  function openEditModal(disciplina) {
    setEditingDisciplina(disciplina)
    setForm({
      codigo: disciplina.codigo,
      nome: disciplina.nome,
      cargaHoraria: String(disciplina.cargaHoraria),
    })
    setFormError('')
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditingDisciplina(null)
    setForm({ codigo: '', nome: '', cargaHoraria: '' })
    setFormError('')
  }

  async function handleSaveDisciplina(e) {
    e.preventDefault()
    setFormError('')
    const codigo = form.codigo.trim()
    const nome = form.nome.trim()
    const carga = form.cargaHoraria.trim()
    if (!codigo || !nome || !carga) {
      setFormError('Preencha todos os campos.')
      return
    }
    const cargaNum = parseInt(carga, 10)
    if (isNaN(cargaNum) || cargaNum <= 0) {
      setFormError('Carga horária deve ser um número positivo.')
      return
    }
    setSaving(true)
    try {
      const body = { codigo, nome, cargaHoraria: cargaNum }
      if (editingDisciplina) {
        const updated = await api(`/disciplinas/${editingDisciplina.id}`, {
          method: 'PUT',
          body,
        })
        setDisciplinas((prev) =>
          prev.map((d) => (d.id === editingDisciplina.id ? updated : d))
        )
      } else {
        const created = await api('/disciplinas', {
          method: 'POST',
          body,
        })
        setDisciplinas((prev) => [...prev, created])
      }
      setToast(editingDisciplina ? 'Disciplina atualizada com sucesso!' : 'Disciplina criada com sucesso!')
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
      await api(`/disciplinas/${deleteConfirm.id}`, { method: 'DELETE' })
      setDisciplinas((prev) => prev.filter((d) => d.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      setToast('Disciplina excluída com sucesso!')
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
            Disciplinas
          </Text>
          <Text size="2" color="gray">
            Gerencie as disciplinas do sistema
          </Text>
        </Flex>
        <Button size="3" onClick={openNewModal}>
          + Adicionar Disciplina
        </Button>
      </Flex>

      <Card>
        <Flex direction="column" gap="4" p="4">
          <Text size="3" weight="bold">
            {disciplinas.length} disciplinas cadastradas
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
                  <Table.ColumnHeaderCell>Codigo</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Carga Horaria (h)</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell align="right">Ações</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {disciplinas.map((d) => (
                  <Table.Row key={d.id}>
                    <Table.Cell>{d.codigo}</Table.Cell>
                    <Table.Cell>{d.nome}</Table.Cell>
                    <Table.Cell>{d.cargaHoraria}h</Table.Cell>
                    <Table.Cell align="right">
                      <Flex gap="2" justify="end">
                        <IconButton
                          size="2"
                          variant="ghost"
                          onClick={() => openEditModal(d)}
                          title="Editar"
                        >
                          <PencilIcon />
                        </IconButton>
                        <IconButton
                          size="2"
                          variant="ghost"
                          color="red"
                          onClick={() => setDeleteConfirm(d)}
                          title={deleting ? 'Excluindo...' : 'Excluir'}
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
            {editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
          </Dialog.Title>
          <Dialog.Description>
            {editingDisciplina
              ? 'Altere os dados da disciplina.'
              : 'Preencha os dados para criar uma nova disciplina.'}
          </Dialog.Description>
          <form onSubmit={handleSaveDisciplina}>
            <Flex direction="column" gap="4" mt="4">
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Codigo
                </Text>
                <TextField.Root
                  placeholder="Ex: MAT101"
                  value={form.codigo}
                  onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                  size="3"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Nome
                </Text>
                <TextField.Root
                  placeholder="Nome da disciplina"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  size="3"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Carga Horaria (horas)
                </Text>
                <TextField.Root
                  type="number"
                  placeholder="Ex: 60"
                  value={form.cargaHoraria}
                  onChange={(e) => setForm((f) => ({ ...f, cargaHoraria: e.target.value }))}
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
                  {saving ? 'Salvando...' : editingDisciplina ? 'Salvar' : 'Criar Disciplina'}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={!!deleteConfirm} onOpenChange={(open) => !open && (setDeleteConfirm(null), setDeleteError(null), setDeleting(false))}>
        <AlertDialog.Content style={{ maxWidth: 440 }}>
          <AlertDialog.Title>Excluir Disciplina</AlertDialog.Title>
          <AlertDialog.Description>
            Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.
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
