import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Card,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Badge,
  Spinner,
  Text
} from '@chakra-ui/react';
import axios from 'axios';

// Tipo para dados de consultores
interface Consultant {
  nome_consultor: string;
  quantidade_efetivacoes: number;
  soma_total_premios: number;
  media_premio: number;
}

// Função para calcular o total e a média dos prêmios
const calculatePrizeStats = (total: number, quantity: number) => {
  const average = quantity > 0 ? total / quantity : 0;
  return { total, average };
};

// Função para formatar a data no formato YYYY/MM/DD
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é zero-indexado
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const ConsultantsPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configura as datas iniciais
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(formatDate(sevenDaysAgo)); // Formato YYYY/MM/DD
    setEndDate(formatDate(today)); // Formato YYYY/MM/DD
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axios.post('http://localhost:3000/api/propostas_efetivadas/get', {
            startDate: startDate,
            endDate: endDate
          });
          setConsultants(response.data.efetivacoes); // Corrige o acesso ao array de consultores
        } catch (error) {
          setError('Erro ao buscar dados. Tente novamente mais tarde.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [startDate, endDate]);

  // Cálculo dos totais e médias
  const totalEfetivacoes = consultants.reduce((acc, cur) => acc + cur.quantidade_efetivacoes, 0);
  const totalPremios = consultants.reduce((acc, cur) => acc + cur.soma_total_premios, 0);
  const meta = 20000000; // Valor fixo para o exemplo

  return (
    <Container maxW="container.lg" mt={2} borderRadius={20}>
      {/* Logo */}
      <Box textAlign="center" mb={3}>
        <Image src="https://i.ibb.co/nC5GQWJ/Logo.png" alt="Logo" boxSize="150px" objectFit="contain" mx="auto" />
      </Box>

      {/* Cards de Meta */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card p={6} shadow="md" borderRadius="md" textAlign="center" bg="white" borderColor="green.200" borderWidth="1px">
          <Heading size="md" color="green.600">Total Efetivações</Heading>
          <Heading m={5} size="lg" color="green.500">{totalEfetivacoes}</Heading>
        </Card>

        <Card p={6} shadow="md" borderRadius="md" textAlign="center" bg="white" borderColor="green.200" borderWidth="1px">
          <Heading size="md" color="green.600">Total Prêmios</Heading>
          <Heading m={5} size="md" color="green.500">R$ {totalPremios.toFixed(2)}</Heading>
        </Card>

        <Card p={6} shadow="md" borderRadius="md" textAlign="center" bg="white" borderColor="green.200" borderWidth="1px">
          <Heading size="md" color="green.600">Meta</Heading>
          <Heading m={5} size="md" color="green.500">R$ {meta.toFixed(2)}</Heading>
        </Card>
      </SimpleGrid>

      {/* Filtro por Período */}
      <Box mb={6}>
        <FormControl id="date-range" mb={6}>
          <FormLabel>Filtro por Período</FormLabel>
          <Input
            bg="white"
            type="date"
            value={startDate.replace(/\//g, '-')} // Converte YYYY/MM/DD para YYYY-MM-DD
            onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value.replace(/-/g, '/'))} // Converte YYYY-MM-DD para YYYY/MM/DD
            placeholder="Data de Início"
            mb={2}
          />
          <Input
            bg="white"
            type="date"
            value={endDate.replace(/\//g, '-')} // Converte YYYY/MM/DD para YYYY-MM-DD
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value.replace(/-/g, '/'))} // Converte YYYY-MM-DD para YYYY/MM/DD
            placeholder="Data de Fim"
            mb={4}
          />
          <Button colorScheme="green" onClick={() => {
            if (startDate && endDate) {
              // Recarrega os dados quando o filtro é aplicado
              const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                  const response = await axios.post('http://localhost:3000/api/propostas_efetivadas/get', {
                    startDate: startDate,
                    endDate: endDate
                  });
                  setConsultants(response.data.efetivacoes); // Corrige o acesso ao array de consultores
                } catch (error) {
                  setError('Erro ao buscar dados. Tente novamente mais tarde.');
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }
          }}>Aplicar Filtro</Button>
        </FormControl>
      </Box>

      {/* Mensagem de erro ou carregamento */}
      {loading && <Box textAlign="center" mb={4}><Spinner size="lg" color="green.500" /></Box>}
      {error && <Text color="red.500" textAlign="center">{error}</Text>}

      {/* Tabela de Consultores */}
      <Heading as="h2" mb={4} color="green.600">Consultores</Heading>
      <Table variant="simple" bg="white" borderColor="green.200" borderWidth="1px">
        <Thead bg="green.50">
          <Tr>
            <Th color="green.500">Nome</Th>
            <Th color="green.500">Quantidade</Th>
            <Th color="green.500">Soma total</Th>
            <Th color="green.500">Média do Prêmio</Th>
          </Tr>
        </Thead>
        <Tbody>
          {consultants.map((consultant, index) => {
            const { total, average } = calculatePrizeStats(consultant.soma_total_premios, consultant.quantidade_efetivacoes);

            return (
              <Tr key={index}>
                <Td>{consultant.nome_consultor}</Td>
                <Td>{consultant.quantidade_efetivacoes}</Td>
                <Td>
                  <Badge colorScheme="green" borderRadius="md" p={2}>
                    R$ {total.toFixed(2)}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme="green" borderRadius="md" p={2}>
                    R$ {average.toFixed(2)}
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Container>
  );
};

export default ConsultantsPage;
