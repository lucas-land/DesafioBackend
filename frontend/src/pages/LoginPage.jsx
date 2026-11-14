import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, Flex, IconButton, Text, TextField } from '@radix-ui/themes'
import { useAuth } from '../contexts/AuthContext'
import LogoIcon from '../components/LogoIcon'
import { EyeIcon, EyeOffIcon } from '../components/Icons'

export default function LoginPage() {
  const { login, registrar } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('login')
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  function trocarModo(proximo) {
    setModo(proximo)
    setErro('')
    setAviso('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setAviso('')

    const userTrimmed = usuario.trim()
    if (!userTrimmed || !senha.trim()) {
      setErro('Preencha usuário e senha.')
      return
    }

    setLoading(true)
    try {
      if (modo === 'cadastro') {
        await registrar(userTrimmed, senha)
        setSenha('')
        setModo('login')
        setAviso('Conta criada. Entre com o usuário e a senha cadastrados.')
        return
      }

      const result = await login(userTrimmed, senha)
      if (result.success) {
        if (result.perfil === 'admin') navigate('/admin')
        else navigate('/aluno')
      } else {
        setErro(result.message || 'Usuário ou senha inválidos.')
      }
    } catch (err) {
      setErro(err.message || 'Erro ao conectar. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const cadastrando = modo === 'cadastro'

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}
    >
      <Card size="3" style={{ maxWidth: 400, width: '100%' }}>
        <Flex direction="column" gap="5">
          <Flex direction="column" align="center" gap="2">
            <LogoIcon />
            <Text size="5" weight="bold">
              Sistema Acadêmico
            </Text>
            <Text size="2" color="gray">
              Matrículas e Gestão de Turmas
            </Text>
          </Flex>

          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Usuario
                </Text>
                <TextField.Root
                  placeholder="Digite seu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  size="3"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box>
                <Text as="label" size="2" weight="medium" style={{ display: 'block', marginBottom: 6 }}>
                  Senha
                </Text>
                <TextField.Root
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  size="3"
                  style={{ width: '100%' }}
                >
                  <TextField.Slot side="right">
                    <IconButton
                      type="button"
                      size="1"
                      variant="ghost"
                      color="gray"
                      aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      aria-pressed={mostrarSenha}
                      onClick={() => setMostrarSenha((visivel) => !visivel)}
                    >
                      {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
                    </IconButton>
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              {cadastrando && (
                <Text size="1" color="gray">
                  A senha precisa ter no mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
                </Text>
              )}

              {aviso && (
                <Text size="2" color="green">
                  {aviso}
                </Text>
              )}

              {erro && (
                <Text size="2" color="red">
                  {erro}
                </Text>
              )}

              <Button type="submit" size="3" style={{ width: '100%' }} disabled={loading}>
                {loading
                  ? cadastrando
                    ? 'Criando conta...'
                    : 'Entrando...'
                  : cadastrando
                    ? 'Criar conta de aluno'
                    : '→ Entrar'}
              </Button>
            </Flex>
          </form>

          <Button
            type="button"
            variant="ghost"
            onClick={() => trocarModo(cadastrando ? 'login' : 'cadastro')}
          >
            {cadastrando ? 'Já tenho conta' : 'Criar conta de aluno'}
          </Button>
        </Flex>
      </Card>
    </Flex>
  )
}
