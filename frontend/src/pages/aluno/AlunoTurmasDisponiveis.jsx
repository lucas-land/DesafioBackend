import { useState, useEffect } from 'react'
import { Badge, Box, Button, Card, Flex, Grid, Text } from '@radix-ui/themes'
import { useAuth } from '../../contexts/AuthContext'
import { Toast, ToastError } from '../../components/Toast'
import { UsersIcon, CheckIcon } from '../../components/Icons'
import { api } from '../../services/api'

export default function AlunoTurmasDisponiveis() {
  const { user } = useAuth()
  const [turmas, setTurmas] = useState([])
  const [matriculas, setMatriculas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingTurmaId, setLoadingTurmaId] = useState(null)
  const [toast, setToast] = useState(null)
  const [toastError, setToastError] = useState(null)

  const alunoId = user?.id != null ? String(user.id) : null
  const myMatriculas = matriculas.filter((m) => String(m.alunoId) === alunoId)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    async function load() {
      try {
        setError(null)
        const [turmasData, matriculasData] = await Promise.all([
          api('/turmas', { signal }),
          api('/matriculas', { signal }),
        ])
        setTurmas(Array.isArray(turmasData) ? turmasData : [])
        setMatriculas(Array.isArray(matriculasData) ? matriculasData : [])
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Erro ao conectar. Verifique se o servidor está rodando.')
        setTurmas([])
        setMatriculas([])
      } finally {
        if (!signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  function vagasDisponiveis(t) {
    return t.limiteVagas - t.vagasOcupadas
  }

  function isLotada(t) {
    return vagasDisponiveis(t) === 0
  }

  function isMatriculado(turmaId) {
    return myMatriculas.some((m) => String(m.turmaId) === String(turmaId))
  }

  function hasConflitoHorario(turma) {
    return myMatriculas.some(
      (m) => m.diaSemana === turma.diaSemana && m.turno === turma.turno,
    )
  }

  async function handleMatricular(turma) {
    if (isMatriculado(turma.id)) {
      setToastError('Você já está matriculado nesta turma.')
      return
    }
    if (isLotada(turma)) {
      setToastError('Não há vagas disponíveis nesta turma.')
      return
    }
    if (hasConflitoHorario(turma)) {
      setToastError('Conflito de horário com outra matrícula.')
      return
    }
    setLoadingTurmaId(turma.id)
    setToastError(null)
    try {
      const created = await api('/matriculas', {
        method: 'POST',
        body: {
          alunoId,
          turmaId: Number(turma.id),
        },
      })
      setMatriculas((prev) => [...prev, created])
      setTurmas((prev) =>
        prev.map((t) =>
          String(t.id) === String(turma.id)
            ? { ...t, vagasOcupadas: Number(t.vagasOcupadas) + 1 }
            : t,
        ),
      )
      setToast('Matrícula realizada com sucesso!')
    } catch (err) {
      setToastError(err.message || 'Erro ao realizar matrícula. Tente novamente.')
    } finally {
      setLoadingTurmaId(null)
    }
  }

  return (
    <Flex direction="column" gap="5" p="6">
      <Flex direction="column" gap="1">
        <Text size="6" weight="bold">
          Turmas Disponíveis
        </Text>
        <Text size="2" color="gray">
          Confira as turmas com vagas abertas e realize sua matrícula
        </Text>
      </Flex>

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
      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
        {turmas.map((t) => {
          const lotada = isLotada(t)
          const matriculado = isMatriculado(t.id)
          const vagas = vagasDisponiveis(t)

          return (
            <Card
              key={t.id}
              size="3"
              style={{
                backgroundColor: matriculado ? 'var(--green-3)' : undefined,
                position: 'relative',
              }}
            >
              {(matriculado || lotada) && (
                <Box style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge
                    size="1"
                    color={matriculado ? 'green' : 'red'}
                    variant="soft"
                  >
                    {matriculado ? 'Matriculado' : 'Lotada'}
                  </Badge>
                </Box>
              )}
              <Flex direction="column" gap="3">
                <Flex direction="column" gap="0">
                  <Text size="4" weight="bold">
                    {t.disciplinaNome}
                  </Text>
                  <Text size="2" color="gray">
                    {t.disciplinaCodigo}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="2" color="gray">
                    Professor: {t.professorNome}
                  </Text>
                  <Text size="2" color="gray">
                    Dia: {t.diaSemana}
                  </Text>
                  <Text size="2" color="gray">
                    Turno: {t.turno}
                  </Text>
                  <Text size="2" weight="medium" color={vagas === 0 ? 'red' : 'green'}>
                    Vagas: {vagas} de {t.limiteVagas}
                  </Text>
                </Flex>
                {matriculado ? (
                  <Button size="3" variant="soft" color="gray" disabled>
                    <CheckIcon />
                    Já Matriculado
                  </Button>
                ) : lotada ? (
                  <Button size="3" variant="soft" color="gray" disabled>
                    <UsersIcon />
                    Sem Vagas
                  </Button>
                ) : (
                  <Button
                    size="3"
                    onClick={() => handleMatricular(t)}
                    loading={loadingTurmaId === t.id}
                    disabled={loadingTurmaId !== null}
                  >
                    <UsersIcon />
                    Matricular-se
                  </Button>
                )}
              </Flex>
            </Card>
          )
        })}
      </Grid>
      )}

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
      {toastError && (
        <ToastError message={toastError} onClose={() => setToastError(null)} />
      )}
    </Flex>
  )
}
